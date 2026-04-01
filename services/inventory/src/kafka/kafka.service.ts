import { Injectable, OnModuleDestroy, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export interface KafkaMessage {
  key?: string;
  value: Record<string, unknown>;
  headers?: Record<string, string>;
}

@Injectable()
export class KafkaService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private connected = false;

  constructor(@Inject('KAFKA_CLIENT') private readonly client: ClientKafka) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      this.connected = true;
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.warn('Kafka not available, running without event streaming', error?.message);
    }
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.client.close();
    }
  }

  async emit(topic: string, message: KafkaMessage): Promise<void> {
    if (!this.connected) {
      this.logger.warn(`Kafka not connected, skipping emit to topic: ${topic}`);
      return;
    }
    try {
      await firstValueFrom(
        this.client.emit(topic, {
          key: message.key,
          value: JSON.stringify({
            ...message.value,
            timestamp: new Date().toISOString(),
            source: 'inventory-service',
          }),
          headers: {
            'content-type': 'application/json',
            ...message.headers,
          },
        }),
      );
      this.logger.debug(`Event emitted to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to emit event to topic ${topic}`, error);
    }
  }
}
