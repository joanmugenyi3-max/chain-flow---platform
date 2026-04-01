import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  Logger,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_CLIENT } from './kafka.module';

export enum MiningKafkaTopic {
  EXTRACTION_RECORDED = 'mining.extraction.recorded',
  INCIDENT_REPORTED = 'mining.incident.reported',
  IOT_ALERT = 'mining.iot.alert',
  EQUIPMENT_ALERT = 'mining.equipment.alert',
  ESG_METRIC_RECORDED = 'mining.esg.metric.recorded',
  SITE_CREATED = 'mining.site.created',
  EQUIPMENT_MAINTENANCE = 'mining.equipment.maintenance',
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);

  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
    this.logger.log('Kafka producer disconnected');
  }

  async emit<T>(
    topic: MiningKafkaTopic,
    payload: T,
    key?: string,
  ): Promise<void> {
    try {
      const message = {
        key: key || `mining-${Date.now()}`,
        value: JSON.stringify({
          ...payload,
          _meta: {
            topic,
            service: 'mining-service',
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        }),
      };

      this.kafkaClient.emit(topic, message);
      this.logger.debug(`Emitted event to ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to emit Kafka event to ${topic}:`, error);
      // Don't throw — Kafka failures should not block primary operations
    }
  }
}
