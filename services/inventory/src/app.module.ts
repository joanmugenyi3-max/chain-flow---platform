import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { ProductsModule } from './products/products.module';
import { InventoryItemsModule } from './inventory-items/inventory-items.module';
import { MovementsModule } from './movements/movements.module';
import { KafkaModule } from './kafka/kafka.module';
import { AlertsModule } from './alerts/alerts.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    KafkaModule,
    WarehousesModule,
    ProductsModule,
    InventoryItemsModule,
    MovementsModule,
    AlertsModule,
    HealthModule,
  ],
})
export class AppModule {}
