import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';

export const KAFKA_CLIENT = 'PROCUREMENT_KAFKA_CLIENT';

export const KAFKA_TOPICS = {
  PO_CREATED: 'procurement.po.created',
  PO_APPROVED: 'procurement.po.approved',
  PO_SENT: 'procurement.po.sent',
  PO_RECEIVED: 'procurement.po.received',
  SUPPLIER_CREATED: 'procurement.supplier.created',
  CONTRACT_SIGNED: 'procurement.contract.signed',
  CONTRACT_EXPIRING: 'procurement.contract.expiring',
  CONTRACT_TERMINATED: 'procurement.contract.terminated',
  CONTRACT_RENEWED: 'procurement.contract.renewed',
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: KAFKA_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const brokers = configService
            .get<string>('KAFKA_BROKERS', 'localhost:9092')
            .split(',');

          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'procurement-producer',
                brokers,
                retry: {
                  initialRetryTime: 300,
                  retries: 10,
                },
              },
              producer: {
                allowAutoTopicCreation: true,
                transactionTimeout: 30000,
              },
            },
          };
        },
      },
    ]),
  ],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule {}
