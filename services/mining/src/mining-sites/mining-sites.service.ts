import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMiningSiteDto,
  UpdateMiningSiteDto,
  CreateMiningZoneDto,
} from './dto/create-mining-site.dto';
import { KafkaService, MiningKafkaTopic } from '../kafka/kafka.service';

@Injectable()
export class MiningSitesService {
  private readonly logger = new Logger(MiningSitesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
  ) {}

  async findAll(query: {
    tenantId?: string;
    country?: string;
    status?: string;
    oreType?: string;
    page?: number;
    limit?: number;
  }) {
    const { tenantId, country, status, oreType, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (tenantId) where.tenantId = tenantId;
    if (country) where.country = { contains: country, mode: 'insensitive' };
    if (status) where.status = status;
    if (oreType) where.primaryOreType = oreType;

    const [data, total] = await Promise.all([
      this.prisma.miningSite.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { equipment: true, zones: true, extractions: true },
          },
        },
      }),
      this.prisma.miningSite.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, tenantId?: string) {
    const where: any = { id, deletedAt: null };
    if (tenantId) where.tenantId = tenantId;

    const site = await this.prisma.miningSite.findFirst({
      where,
      include: {
        zones: { where: { isActive: true } },
        equipment: {
          where: { deletedAt: null },
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            status: true,
          },
        },
        _count: {
          select: { extractions: true, safetyIncidents: true },
        },
      },
    });

    if (!site) throw new NotFoundException(`Mining site ${id} not found`);
    return site;
  }

  async create(dto: CreateMiningSiteDto, tenantId: string) {
    const existing = await this.prisma.miningSite.findFirst({
      where: { code: dto.code, tenantId, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException(`Site with code ${dto.code} already exists`);
    }

    const site = await this.prisma.miningSite.create({
      data: {
        ...dto,
        tenantId,
        certifications: dto.certifications || [],
        status: dto.status || 'ACTIVE',
        isActive: dto.isActive ?? true,
      },
    });

    await this.kafka.emit(
      MiningKafkaTopic.SITE_CREATED,
      { siteId: site.id, code: site.code, tenantId },
      site.id,
    );

    return site;
  }

  async update(id: string, dto: UpdateMiningSiteDto, tenantId?: string) {
    await this.findOne(id, tenantId);

    return this.prisma.miningSite.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() },
    });
  }

  async getDashboard(id: string, tenantId?: string) {
    const site = await this.findOne(id, tenantId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayExtraction, weekExtraction, activeEquipment, recentIncidents, latestEsg] =
      await Promise.all([
        // Today's extraction total
        this.prisma.extractionRecord.aggregate({
          where: { siteId: id, date: { gte: today }, deletedAt: null },
          _sum: { tonnage: true },
          _avg: { oreGrade: true, recoveryRate: true },
        }),

        // Last 7 days extraction
        this.prisma.extractionRecord.groupBy({
          by: ['date'],
          where: {
            siteId: id,
            date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            deletedAt: null,
          },
          _sum: { tonnage: true },
          orderBy: { date: 'asc' },
        }),

        // Equipment status counts
        this.prisma.equipment.groupBy({
          by: ['status'],
          where: { siteId: id, deletedAt: null },
          _count: true,
        }),

        // Recent incidents
        this.prisma.safetyIncident.count({
          where: {
            siteId: id,
            date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            deletedAt: null,
          },
        }),

        // Latest ESG record
        this.prisma.esgMetric.findFirst({
          where: { siteId: id, deletedAt: null },
          orderBy: { period: 'desc' },
        }),
      ]);

    const equipmentMap = activeEquipment.reduce(
      (acc, cur) => ({ ...acc, [cur.status]: cur._count }),
      {} as Record<string, number>,
    );

    const totalEquipment = Object.values(equipmentMap).reduce((a, b) => a + b, 0);
    const operationalEquipment = equipmentMap['OPERATIONAL'] || 0;
    const availabilityPct =
      totalEquipment > 0 ? (operationalEquipment / totalEquipment) * 100 : 0;

    return {
      siteId: id,
      siteName: site.name,
      timestamp: new Date().toISOString(),
      production: {
        todayTonnage: todayExtraction._sum.tonnage || 0,
        targetDailyTonnage: site.targetDailyProductionTonnes || 0,
        achievementPct: site.targetDailyProductionTonnes
          ? ((todayExtraction._sum.tonnage || 0) / site.targetDailyProductionTonnes) * 100
          : null,
        avgOreGrade: todayExtraction._avg.oreGrade || 0,
        avgRecoveryRate: todayExtraction._avg.recoveryRate || 0,
        last7Days: weekExtraction,
      },
      equipment: {
        total: totalEquipment,
        byStatus: equipmentMap,
        availabilityPct: Math.round(availabilityPct * 10) / 10,
      },
      safety: {
        incidentsLast30Days: recentIncidents,
        safetyScore: Math.max(0, 100 - recentIncidents * 5),
      },
      esg: latestEsg
        ? {
            period: latestEsg.period,
            ghgScope1: latestEsg.ghgScope1Tonnes,
            ghgScope2: latestEsg.ghgScope2Tonnes,
            waterWithdrawn: latestEsg.waterWithdrawnM3,
            renewableEnergyPct: latestEsg.renewableEnergyPct,
          }
        : null,
    };
  }

  async getProductionHistory(
    id: string,
    query: { from?: string; to?: string; groupBy?: string },
    tenantId?: string,
  ) {
    await this.findOne(id, tenantId);

    const from = query.from ? new Date(query.from) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : new Date();

    const records = await this.prisma.extractionRecord.groupBy({
      by: ['date'],
      where: { siteId: id, date: { gte: from, lte: to }, deletedAt: null },
      _sum: { tonnage: true, drilledMeters: true },
      _avg: { oreGrade: true, recoveryRate: true, wasteRatio: true },
      orderBy: { date: 'asc' },
    });

    return {
      siteId: id,
      from: from.toISOString(),
      to: to.toISOString(),
      records: records.map((r) => ({
        date: r.date,
        tonnage: r._sum.tonnage || 0,
        avgOreGrade: r._avg.oreGrade || 0,
        avgRecoveryRate: r._avg.recoveryRate || 0,
        avgWasteRatio: r._avg.wasteRatio || 0,
        drilledMeters: r._sum.drilledMeters || 0,
      })),
    };
  }

  async getZones(id: string, tenantId?: string) {
    await this.findOne(id, tenantId);

    return this.prisma.miningZone.findMany({
      where: { siteId: id, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async createZone(id: string, dto: CreateMiningZoneDto, tenantId?: string) {
    await this.findOne(id, tenantId);

    const existing = await this.prisma.miningZone.findFirst({
      where: { siteId: id, code: dto.code, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException(`Zone with code ${dto.code} already exists in this site`);
    }

    return this.prisma.miningZone.create({
      data: { ...dto, siteId: id },
    });
  }
}
