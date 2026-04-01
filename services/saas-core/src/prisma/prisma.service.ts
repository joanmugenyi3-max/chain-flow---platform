import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'colorless',
    });
  }

  async onModuleInit(): Promise<void> {
    // Log slow queries in development
    if (process.env.NODE_ENV !== 'production') {
      (this as any).$on('query', (e: Prisma.QueryEvent) => {
        if (e.duration > 500) {
          this.logger.warn(
            `Slow query detected (${e.duration}ms): ${e.query}`,
          );
        }
      });
    }

    (this as any).$on('error', (e: Prisma.LogEvent) => {
      this.logger.error(`Prisma error: ${e.message}`, e.target);
    });

    try {
      await this.$connect();
      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  /**
   * Execute operations within a tenant context.
   * Applies organizationId filter automatically to queries.
   */
  withTenant(organizationId: string): Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'> {
    return this.$extends({
      query: {
        $allModels: {
          async findMany({ args, query }: any) {
            args.where = { ...args.where, organizationId };
            return query(args);
          },
          async findFirst({ args, query }: any) {
            args.where = { ...args.where, organizationId };
            return query(args);
          },
          async findUnique({ args, query }: any) {
            args.where = { ...args.where, organizationId };
            return query(args);
          },
          async count({ args, query }: any) {
            args.where = { ...args.where, organizationId };
            return query(args);
          },
          async update({ args, query }: any) {
            args.where = { ...args.where, organizationId };
            return query(args);
          },
          async delete({ args, query }: any) {
            args.where = { ...args.where, organizationId };
            return query(args);
          },
        },
      },
    }) as any;
  }

  /**
   * Health check - verify DB is reachable.
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up test data (only usable in test environment).
   */
  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanDatabase can only be called in test environment');
    }
    const tablenames = await this.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    if (tables.length > 0) {
      await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  }
}
