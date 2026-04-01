import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { PrismaModule } from './prisma/prisma.module';
import { MiningSitesModule } from './mining-sites/mining-sites.module';
import { EquipmentModule } from './equipment/equipment.module';
import { IoTModule } from './iot/iot.module';
import { ExtractionModule } from './extraction/extraction.module';
import { SafetyModule } from './safety/safety.module';
import { EsgModule } from './esg/esg.module';
import { KafkaModule } from './kafka/kafka.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
          password: configService.get<string>('REDIS_PASSWORD'),
          ttl: configService.get<number>('REDIS_TTL', 300) * 1000,
        }),
      }),
    }),
    PrismaModule,
    KafkaModule,
    HealthModule,
    MiningSitesModule,
    EquipmentModule,
    IoTModule,
    ExtractionModule,
    SafetyModule,
    EsgModule,
  ],
})
export class AppModule {}
