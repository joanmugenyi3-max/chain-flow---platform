import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KafkaService } from '../kafka/kafka.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

const CAPACITY_ALERT_THRESHOLD = 90; // percent

@Injectable()
export class WarehousesService {
  private readonly logger = new Logger(WarehousesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
  ) {}

  async findAll(
    tenantId: string,
    params: {
      page?: number;
      limit?: number;
      type?: string;
      country?: string;
      isActive?: boolean;
    },
  ) {
    const { page = 1, limit = 20, type, country, isActive } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };
    if (type) where.type = type;
    if (country) where.country = country;
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { inventoryItems: true } },
        },
      }),
      this.prisma.warehouse.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { inventoryItems: true } },
      },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse ${id} not found`);
    }

    const utilization = await this.calculateUtilization(warehouse);
    return { ...warehouse, utilization };
  }

  async create(tenantId: string, dto: CreateWarehouseDto) {
    const existing = await this.prisma.warehouse.findFirst({
      where: { code: dto.code, tenantId },
    });
    if (existing) {
      throw new ConflictException(`Warehouse with code ${dto.code} already exists`);
    }

    return this.prisma.warehouse.create({
      data: { ...dto, tenantId },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateWarehouseDto) {
    await this.findOne(tenantId, id);

    if (dto.code) {
      const conflict = await this.prisma.warehouse.findFirst({
        where: { code: dto.code, tenantId, NOT: { id } },
      });
      if (conflict) {
        throw new ConflictException(`Warehouse code ${dto.code} already in use`);
      }
    }

    return this.prisma.warehouse.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    const itemCount = await this.prisma.inventoryItem.count({
      where: { warehouseId: id, quantity: { gt: 0 } },
    });
    if (itemCount > 0) {
      throw new ConflictException(
        `Cannot delete warehouse with ${itemCount} active inventory items`,
      );
    }

    return this.prisma.warehouse.delete({ where: { id } });
  }

  async getInventory(tenantId: string, warehouseId: string, params: { page?: number; limit?: number }) {
    await this.findOne(tenantId, warehouseId);
    const { page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where: { warehouseId, tenantId },
        skip,
        take: limit,
        include: { product: true },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.inventoryItem.count({ where: { warehouseId, tenantId } }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getCapacity(tenantId: string, warehouseId: string) {
    const warehouse = await this.findOne(tenantId, warehouseId);
    return this.calculateUtilization(warehouse);
  }

  async getMapData(tenantId: string) {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        city: true,
        country: true,
        lat: true,
        lng: true,
        totalCapacity: true,
        capacityUnit: true,
        isActive: true,
        _count: { select: { inventoryItems: true } },
      },
    });

    return warehouses.map((wh) => ({
      ...wh,
      coordinates: { lat: wh.lat, lng: wh.lng },
    }));
  }

  private async calculateUtilization(warehouse: { id: string; totalCapacity: number }) {
    // Sum all occupied capacity from inventory items
    const items = await this.prisma.inventoryItem.findMany({
      where: { warehouseId: warehouse.id },
      include: { product: { select: { volume: true } } },
    });

    const usedCapacity = items.reduce((sum, item) => {
      const vol = item.product?.volume ?? 0;
      return sum + item.quantity * vol;
    }, 0);

    const usedPercent =
      warehouse.totalCapacity > 0
        ? Math.min((usedCapacity / warehouse.totalCapacity) * 100, 100)
        : 0;

    if (usedPercent >= CAPACITY_ALERT_THRESHOLD) {
      await this.kafka.emit('inventory.warehouse.capacity_alert', {
        key: warehouse.id,
        value: {
          warehouseId: warehouse.id,
          usedPercent,
          totalCapacity: warehouse.totalCapacity,
          usedCapacity,
          threshold: CAPACITY_ALERT_THRESHOLD,
        },
      });
    }

    return {
      totalCapacity: warehouse.totalCapacity,
      usedCapacity,
      availableCapacity: Math.max(warehouse.totalCapacity - usedCapacity, 0),
      utilizationPercent: Math.round(usedPercent * 100) / 100,
      isNearCapacity: usedPercent >= CAPACITY_ALERT_THRESHOLD,
    };
  }
}
