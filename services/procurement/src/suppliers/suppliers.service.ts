import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KafkaService } from '../kafka/kafka.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierFilterDto } from './dto/supplier-filter.dto';
import * as ExcelJS from 'exceljs';
import { parse } from 'csv-parse/sync';
import { Readable } from 'stream';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface SupplierPerformance {
  supplierId: string;
  supplierName: string;
  totalOrders: number;
  deliveryRate: number;
  onTimeDeliveryRate: number;
  qualityScore: number;
  priceComplianceRate: number;
  averageLeadTimeDays: number;
  totalSpend: number;
  activeContracts: number;
  overallScore: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaService: KafkaService,
  ) {}

  async findAll(
    organizationId: string,
    filter: SupplierFilterDto,
  ): Promise<PaginatedResult<any>> {
    const {
      search,
      category,
      country,
      status,
      isActive,
      tags,
      minRating,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where: any = { organizationId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { legalName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (country) where.country = country;
    if (status) where.status = status;
    if (isActive !== undefined) where.isActive = isActive;
    if (minRating !== undefined) where.rating = { gte: minRating };
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const skip = (page - 1) * limit;

    const allowedSortFields = [
      'name', 'code', 'country', 'category', 'rating',
      'createdAt', 'updatedAt', 'status',
    ];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          _count: {
            select: {
              purchaseOrders: true,
              contracts: true,
            },
          },
        },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(organizationId: string, id: string): Promise<any> {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: {
            purchaseOrders: true,
            contracts: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async create(
    organizationId: string,
    dto: CreateSupplierDto,
    createdBy: string,
  ): Promise<any> {
    // Check code uniqueness within organization
    const existing = await this.prisma.supplier.findFirst({
      where: { organizationId, code: dto.code },
    });

    if (existing) {
      throw new ConflictException(
        `Supplier with code '${dto.code}' already exists in this organization`,
      );
    }

    const supplier = await this.prisma.supplier.create({
      data: {
        organizationId,
        name: dto.name,
        code: dto.code,
        legalName: dto.legalName,
        country: dto.country,
        address: dto.address,
        contactName: dto.contactName,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        category: dto.category,
        paymentTerms: dto.paymentTerms,
        currency: dto.currency,
        taxId: dto.taxId,
        bankDetails: dto.bankDetails ? (dto.bankDetails as any) : undefined,
        rating: dto.rating ?? 0,
        isActive: dto.isActive ?? true,
        status: dto.status ?? 'ACTIVE',
        tags: dto.tags ?? [],
        notes: dto.notes,
        website: dto.website,
        createdBy,
      },
    });

    await this.kafkaService.publishSupplierCreated(organizationId, {
      supplierId: supplier.id,
      name: supplier.name,
      code: supplier.code,
      category: supplier.category,
      country: supplier.country,
      createdBy,
    });

    this.logger.log(`Created supplier ${supplier.id} for org ${organizationId}`);
    return supplier;
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateSupplierDto,
  ): Promise<any> {
    await this.findOne(organizationId, id);

    if (dto.code) {
      const codeConflict = await this.prisma.supplier.findFirst({
        where: { organizationId, code: dto.code, NOT: { id } },
      });
      if (codeConflict) {
        throw new ConflictException(
          `Supplier with code '${dto.code}' already exists`,
        );
      }
    }

    return this.prisma.supplier.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.code && { code: dto.code }),
        ...(dto.legalName !== undefined && { legalName: dto.legalName }),
        ...(dto.country && { country: dto.country }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.contactName !== undefined && { contactName: dto.contactName }),
        ...(dto.contactEmail !== undefined && { contactEmail: dto.contactEmail }),
        ...(dto.contactPhone !== undefined && { contactPhone: dto.contactPhone }),
        ...(dto.category && { category: dto.category }),
        ...(dto.paymentTerms && { paymentTerms: dto.paymentTerms }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.taxId !== undefined && { taxId: dto.taxId }),
        ...(dto.bankDetails !== undefined && { bankDetails: dto.bankDetails as any }),
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.status && { status: dto.status }),
        ...(dto.tags && { tags: dto.tags }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.website !== undefined && { website: dto.website }),
      },
    });
  }

  async remove(organizationId: string, id: string): Promise<void> {
    const supplier = await this.findOne(organizationId, id);

    // Check for active purchase orders
    const activePOs = await this.prisma.purchaseOrder.count({
      where: {
        organizationId,
        supplierId: id,
        status: { in: ['PENDING_APPROVAL', 'APPROVED', 'SENT'] },
      },
    });

    if (activePOs > 0) {
      throw new BadRequestException(
        `Cannot delete supplier with ${activePOs} active purchase order(s). Close them first.`,
      );
    }

    // Soft-delete by marking inactive
    await this.prisma.supplier.update({
      where: { id },
      data: { isActive: false, status: 'INACTIVE', deletedAt: new Date() },
    });

    this.logger.log(`Soft-deleted supplier ${id} for org ${organizationId}`);
  }

  async getSupplierPurchaseOrders(
    organizationId: string,
    supplierId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<any>> {
    await this.findOne(organizationId, supplierId);

    const skip = (page - 1) * limit;
    const where = { organizationId, supplierId };

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          lines: true,
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getSupplierContracts(
    organizationId: string,
    supplierId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<any>> {
    await this.findOne(organizationId, supplierId);

    const skip = (page - 1) * limit;
    const where = { organizationId, supplierId };

    const [data, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contract.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getPerformance(
    organizationId: string,
    supplierId: string,
  ): Promise<SupplierPerformance> {
    const supplier = await this.findOne(organizationId, supplierId);

    // Aggregate purchase order data
    const poStats = await this.prisma.purchaseOrder.aggregate({
      where: { organizationId, supplierId },
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    const receivedPOs = await this.prisma.purchaseOrder.count({
      where: { organizationId, supplierId, status: 'RECEIVED' },
    });

    const onTimePOs = await this.prisma.purchaseOrder.count({
      where: {
        organizationId,
        supplierId,
        status: 'RECEIVED',
        receivedAt: { lte: this.prisma.purchaseOrder.fields.deliveryDate as any },
      },
    });

    const totalOrders = poStats._count.id;
    const totalSpend = Number(poStats._sum.totalAmount ?? 0);

    const deliveryRate =
      totalOrders > 0 ? Math.round((receivedPOs / totalOrders) * 100) : 0;

    const onTimeDeliveryRate =
      receivedPOs > 0 ? Math.round((onTimePOs / receivedPOs) * 100) : 0;

    // Active contracts
    const activeContracts = await this.prisma.contract.count({
      where: {
        organizationId,
        supplierId,
        status: 'ACTIVE',
      },
    });

    // Compute overall score (weighted average)
    const qualityScore = supplier.rating ? supplier.rating * 20 : 0; // 0-100
    const priceComplianceRate = 85; // Placeholder — in production, compare invoice vs PO price

    const overallScore = Math.round(
      deliveryRate * 0.3 +
        onTimeDeliveryRate * 0.3 +
        qualityScore * 0.2 +
        priceComplianceRate * 0.2,
    );

    return {
      supplierId,
      supplierName: supplier.name,
      totalOrders,
      deliveryRate,
      onTimeDeliveryRate,
      qualityScore,
      priceComplianceRate,
      averageLeadTimeDays: 7, // Placeholder
      totalSpend,
      activeContracts,
      overallScore,
      trend: overallScore >= 75 ? 'IMPROVING' : overallScore >= 50 ? 'STABLE' : 'DECLINING',
    };
  }

  async importFromCsv(
    organizationId: string,
    fileBuffer: Buffer,
    createdBy: string,
  ): Promise<{ imported: number; failed: number; errors: string[] }> {
    let records: any[];

    try {
      records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (error) {
      throw new BadRequestException('Invalid CSV format: ' + error.message);
    }

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2; // +2 because header is row 1

      try {
        // Basic validation
        if (!row.name) {
          throw new Error('Missing required field: name');
        }
        if (!row.code) {
          throw new Error('Missing required field: code');
        }
        if (!row.country) {
          throw new Error('Missing required field: country');
        }
        if (!row.category) {
          throw new Error('Missing required field: category');
        }
        if (!row.currency) {
          throw new Error('Missing required field: currency');
        }

        const existing = await this.prisma.supplier.findFirst({
          where: { organizationId, code: row.code },
        });

        if (existing) {
          // Update existing
          await this.prisma.supplier.update({
            where: { id: existing.id },
            data: {
              name: row.name,
              legalName: row.legalName || null,
              country: row.country,
              address: row.address || null,
              contactName: row.contactName || null,
              contactEmail: row.contactEmail || null,
              contactPhone: row.contactPhone || null,
              category: row.category,
              paymentTerms: row.paymentTerms || 'NET30',
              currency: row.currency,
              taxId: row.taxId || null,
              isActive: row.isActive !== 'false',
              tags: row.tags ? row.tags.split(';').map((t: string) => t.trim()) : [],
            },
          });
        } else {
          await this.prisma.supplier.create({
            data: {
              organizationId,
              name: row.name,
              code: row.code,
              legalName: row.legalName || null,
              country: row.country,
              address: row.address || null,
              contactName: row.contactName || null,
              contactEmail: row.contactEmail || null,
              contactPhone: row.contactPhone || null,
              category: row.category,
              paymentTerms: row.paymentTerms || 'NET30',
              currency: row.currency,
              taxId: row.taxId || null,
              rating: parseFloat(row.rating) || 0,
              isActive: row.isActive !== 'false',
              status: row.status || 'ACTIVE',
              tags: row.tags ? row.tags.split(';').map((t: string) => t.trim()) : [],
              notes: row.notes || null,
              website: row.website || null,
              createdBy,
            },
          });
        }

        imported++;
      } catch (error) {
        failed++;
        errors.push(`Row ${rowNum} (${row.name || 'Unknown'}): ${error.message}`);
      }
    }

    this.logger.log(
      `CSV import for org ${organizationId}: ${imported} imported, ${failed} failed`,
    );

    return { imported, failed, errors };
  }

  async exportToExcel(organizationId: string): Promise<Buffer> {
    const suppliers = await this.prisma.supplier.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ChainFlow Platform';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Suppliers', {
      pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    // Header row styling
    sheet.columns = [
      { header: 'Code', key: 'code', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Legal Name', key: 'legalName', width: 30 },
      { header: 'Country', key: 'country', width: 12 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Contact Name', key: 'contactName', width: 25 },
      { header: 'Contact Email', key: 'contactEmail', width: 30 },
      { header: 'Contact Phone', key: 'contactPhone', width: 20 },
      { header: 'Payment Terms', key: 'paymentTerms', width: 15 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Tax ID', key: 'taxId', width: 20 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Tags', key: 'tags', width: 25 },
      { header: 'Website', key: 'website', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' },
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
      };
    });

    // Add data rows
    suppliers.forEach((supplier, index) => {
      const row = sheet.addRow({
        code: supplier.code,
        name: supplier.name,
        legalName: supplier.legalName || '',
        country: supplier.country,
        category: supplier.category,
        status: supplier.status,
        contactName: supplier.contactName || '',
        contactEmail: supplier.contactEmail || '',
        contactPhone: supplier.contactPhone || '',
        paymentTerms: supplier.paymentTerms,
        currency: supplier.currency,
        taxId: supplier.taxId || '',
        rating: supplier.rating,
        tags: (supplier.tags as string[]).join('; '),
        website: supplier.website || '',
        createdAt: supplier.createdAt.toISOString().split('T')[0],
      });

      // Alternate row background
      if (index % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF1F5F9' },
          };
        });
      }

      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle' };
      });
    });

    // Auto-filter
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columns.length },
    };

    // Freeze header row
    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
