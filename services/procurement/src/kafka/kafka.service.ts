import {
  Injectable,
  Inject,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_CLIENT, KAFKA_TOPICS, KafkaTopic } from './kafka.module';

export interface KafkaMessage<T = unknown> {
  eventType: string;
  organizationId: string;
  timestamp: string;
  source: string;
  payload: T;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);

  constructor(
    @Inject(KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to reply topics if using request-response pattern
    const topics = Object.values(KAFKA_TOPICS);
    topics.forEach((topic) => {
      this.kafkaClient.subscribeToResponseOf(topic);
    });

    try {
      await this.kafkaClient.connect();
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.error('Failed to connect Kafka producer', error);
      // Don't throw — service should still run without Kafka
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.kafkaClient.close();
      this.logger.log('Kafka producer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka producer', error);
    }
  }

  /**
   * Publish a message to a Kafka topic.
   */
  async publish<T = unknown>(
    topic: KafkaTopic,
    message: KafkaMessage<T>,
  ): Promise<void> {
    try {
      await this.kafkaClient.emit(topic, {
        key: message.organizationId,
        value: JSON.stringify(message),
        headers: {
          'event-type': message.eventType,
          'organization-id': message.organizationId,
          source: message.source,
          timestamp: message.timestamp,
        },
      });

      this.logger.debug(
        `Published event [${message.eventType}] to topic [${topic}] for org [${message.organizationId}]`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish event [${message.eventType}] to topic [${topic}]`,
        error,
      );
      // Do not rethrow — Kafka failures should not block primary operations
    }
  }

  /**
   * Publish a PO Created event.
   */
  async publishPOCreated(
    organizationId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.publish(KAFKA_TOPICS.PO_CREATED, {
      eventType: 'procurement.po.created',
      organizationId,
      timestamp: new Date().toISOString(),
      source: 'procurement-service',
      payload,
    });
  }

  /**
   * Publish a PO Approved event.
   */
  async publishPOApproved(
    organizationId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.publish(KAFKA_TOPICS.PO_APPROVED, {
      eventType: 'procurement.po.approved',
      organizationId,
      timestamp: new Date().toISOString(),
      source: 'procurement-service',
      payload,
    });
  }

  /**
   * Publish a PO Sent event.
   */
  async publishPOSent(
    organizationId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.publish(KAFKA_TOPICS.PO_SENT, {
      eventType: 'procurement.po.sent',
      organizationId,
      timestamp: new Date().toISOString(),
      source: 'procurement-service',
      payload,
    });
  }

  /**
   * Publish a PO Received event.
   */
  async publishPOReceived(
    organizationId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.publish(KAFKA_TOPICS.PO_RECEIVED, {
      eventType: 'procurement.po.received',
      organizationId,
      timestamp: new Date().toISOString(),
      source: 'procurement-service',
      payload,
    });
  }

  /**
   * Publish a Supplier Created event.
   */
  async publishSupplierCreated(
    organizationId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.publish(KAFKA_TOPICS.SUPPLIER_CREATED, {
      eventType: 'procurement.supplier.created',
      organizationId,
      timestamp: new Date().toISOString(),
      source: 'procurement-service',
      payload,
    });
  }

  /**
   * Publish a Contract Signed event.
   */
  async publishContractSigned(
    organizationId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.publish(KAFKA_TOPICS.CONTRACT_SIGNED, {
      eventType: 'procurement.contract.signed',
      organizationId,
      timestamp: new Date().toISOString(),
      source: 'procurement-service',
      payload,
    });
  }

  /**
   * Publish a Contract Expiring event.
   */
  async publishContractExpiring(
    organizationId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.publish(KAFKA_TOPICS.CONTRACT_EXPIRING, {
      eventType: 'procurement.contract.expiring',
      organizationId,
      timestamp: new Date().toISOString(),
      source: 'procurement-service',
      payload,
    });
  }
}
