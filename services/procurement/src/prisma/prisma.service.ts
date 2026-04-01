import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });

    // Log slow queries in development
    if (configService.get<string>('NODE_ENV') === 'development') {
      (this.$on as any)('query', (event: Prisma.QueryEvent) => {
        if (event.duration > 200) {
          this.logger.warn(
            `Slow query (${event.duration}ms): ${event.query}`,
          );
        }
      });
    }
  }

  async onModuleInit(): Promise<void> {
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
   * Returns a Prisma client scoped to a specific tenant (organization).
   * Applies organizationId as a global filter via middleware pattern.
   */
  forTenant(organizationId: string): PrismaService {
    const tenantClient = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            // Inject organizationId into where clauses for tenant isolation
            if (args && typeof args === 'object') {
              if ('where' in args) {
                args.where = {
                  ...args.where,
                  organizationId,
                };
              } else if ('data' in args && typeof args.data === 'object') {
                // For create operations, ensure organizationId is set
                args.data = {
                  ...args.data,
                  organizationId,
                };
              }
            }
            return query(args);
          },
        },
      },
    }) as unknown as PrismaService;

    return tenantClient;
  }

  /**
   * Execute operations within a transaction.
   */
  async executeTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(fn);
  }

  /**
   * Health check — verifies database connectivity.
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
