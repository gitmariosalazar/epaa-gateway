import { Module } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { environments } from '../../../settings/environments/environments';
import { provideContextualKafkaClient } from '../../../shared/kafka/provide-contextual-kafka';

const kafkaProviders = [
  // Authentication Kafka Client
  provideContextualKafkaClient(environments.GATEWAY_AUTHENTICATION_KAFKA_CLIENT, {
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: environments.GATEWAY_AUTHENTICATION_KAFKA_CLIENT_ID,
            retry: { retries: 25, initialRetryTime: 1000 },
    },
    consumer: {
      groupId: environments.GATEWAY_AUTHENTICATION_KAFKA_GROUP_ID,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: { fromBeginning: true },
    },
  }),
  // Roles Kafka Client
  provideContextualKafkaClient(environments.GATEWAY_ROLES_KAFKA_CLIENT, {
    options: { consumer: { replyTopic: 'authentication_topic.reply' } },
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: environments.GATEWAY_ROLES_KAFKA_CLIENT_ID,
            retry: { retries: 25, initialRetryTime: 1000 },
    },
    consumer: {
      groupId: environments.GATEWAY_ROLES_KAFKA_GROUP_ID,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: { fromBeginning: true },
    },
  }),
  // Categories Kafka Client
  provideContextualKafkaClient(environments.GATEWAY_CATEGORIES_KAFKA_CLIENT, {
    options: { consumer: { replyTopic: 'authentication_topic.reply' } },
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: environments.GATEWAY_CATEGORIES_KAFKA_CLIENT_ID,
            retry: { retries: 25, initialRetryTime: 1000 },
    },
    consumer: {
      groupId: environments.GATEWAY_CATEGORIES_KAFKA_GROUP_ID,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: { fromBeginning: true },
    },
  }),
  // Permissions Kafka Client
  provideContextualKafkaClient(environments.GATEWAY_PERMISSIONS_KAFKA_CLIENT, {
    options: { consumer: { replyTopic: 'authentication_topic.reply' } },
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: environments.GATEWAY_PERMISSIONS_KAFKA_CLIENT_ID,
            retry: { retries: 25, initialRetryTime: 1000 },
    },
    consumer: {
      groupId: environments.GATEWAY_PERMISSIONS_KAFKA_GROUP_ID,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: { fromBeginning: true },
    },
  }),
  // Rol-Permission Kafka Client
  provideContextualKafkaClient(environments.GATEWAY_ROL_PERMISSION_KAFKA_CLIENT, {
    options: { consumer: { replyTopic: 'authentication_topic.reply' } },
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: environments.GATEWAY_ROL_PERMISSION_KAFKA_CLIENT_ID,
            retry: { retries: 25, initialRetryTime: 1000 },
    },
    consumer: {
      groupId: environments.GATEWAY_ROL_PERMISSION_KAFKA_GROUP_ID,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: { fromBeginning: true },
    },
  }),
  // Users Kafka Client
  provideContextualKafkaClient(environments.GATEWAY_USERS_KAFKA_CLIENT, {
    options: { consumer: { replyTopic: 'authentication_topic.reply' } },
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: environments.GATEWAY_USERS_KAFKA_CLIENT_ID,
            retry: { retries: 25, initialRetryTime: 1000 },
    },
    consumer: {
      groupId: environments.GATEWAY_USERS_KAFKA_GROUP_ID,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: { fromBeginning: true },
    },
  }),
  // Employees Kafka Client
  provideContextualKafkaClient(environments.GATEWAY_EMPLOYEES_KAFKA_CLIENT, {
    options: { consumer: { replyTopic: 'authentication_topic.reply' } },
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: environments.GATEWAY_EMPLOYEES_KAFKA_CLIENT_ID,
            retry: { retries: 25, initialRetryTime: 1000 },
    },
    consumer: {
      groupId: environments.GATEWAY_EMPLOYEES_KAFKA_GROUP_ID,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: { fromBeginning: true },
    },
  }),
  // Auth Kafka Client
  provideContextualKafkaClient(environments.GATEWAY_AUTH_KAFKA_CLIENT, {
    options: { consumer: { replyTopic: 'authentication_topic.reply' } },
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: environments.GATEWAY_AUTH_KAFKA_CLIENT_ID,
            retry: { retries: 25, initialRetryTime: 1000 },
    },
    consumer: {
      groupId: environments.GATEWAY_AUTH_KAFKA_GROUP_ID,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: { fromBeginning: true },
    },
  }),
  // Audit Kafka Client
  provideContextualKafkaClient('GATEWAY_AUDIT_KAFKA_CLIENT', {
    options: { consumer: { replyTopic: 'authentication_topic.reply' } },
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: 'audit-gateway-client',
            retry: { retries: 25, initialRetryTime: 1000 },
    },
    consumer: {
      groupId: 'audit-gateway-group',
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: { fromBeginning: true },
    },
  }),
];

@Module({
  imports: [],
  controllers: [],
  providers: [...kafkaProviders],
  exports: [...kafkaProviders.map(p => p.provide)],
})
export class KafkaAuthenticationModule {}
