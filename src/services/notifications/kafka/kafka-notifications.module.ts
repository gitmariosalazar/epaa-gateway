import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environments } from '../../../settings/environments/environments';
import { provideContextualKafkaClient } from '../../../shared/kafka/provide-contextual-kafka';

/**
 * KafkaNotificationsModule
 * Provides the NOTIFICATIONS_KAFKA_CLIENT for the notifications bounded context.
 * Single Responsibility: owns only the notifications Kafka transport.
 */

const notificationsKafkaProviders = [
  provideContextualKafkaClient('GATEWAY_NOTIFICATIONS_KAFKA_CLIENT', {
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: 'notifications-gateway-client',
      retry: { retries: 25, initialRetryTime: 1000 },
    },
    consumer: {
      groupId: 'notifications-gateway-group',
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: { fromBeginning: true },
      replyTopic: 'notifications_topic.reply',
    },
  } as any),
];

@Module({
  imports: [],
  providers: [...notificationsKafkaProviders],
  exports: [...notificationsKafkaProviders.map((p) => p.provide)],
})
export class KafkaNotificationsModule {}
