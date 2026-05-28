import { Module } from '@nestjs/common';
import { provideContextualKafkaClient } from '../../../../shared/kafka/provide-contextual-kafka';
import { environments } from '../../../../settings/environments/environments';

const epaaLegacyKafkaProviders = [
  // Epaa Legacy Readings Kafka Client
  provideContextualKafkaClient(environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT, {
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      // Adding -gateway avoids collision with the microservice which uses the exact same variable
      clientId: `${environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT_ID}-gw-v3`,
            retry: { retries: 25, initialRetryTime: 1000 },
    },
        producer: {
      idempotent: true,
    },
    consumer: {
      groupId: `${environments.EPAA_LEGACY_READINGS_KAFKA_GROUP_ID}-gw-v3`,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: { fromBeginning: true },
    },
  }),
  // Epaa Legacy Accounting Kafka Client
  provideContextualKafkaClient('EPAA_LEGACY_ACCOUNTING_KAFKA_CLIENT', {
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: `${environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT_ID}-acc-gw-v3`,
            retry: { retries: 25, initialRetryTime: 1000 },
    },

    consumer: {
      groupId: `${environments.EPAA_LEGACY_READINGS_KAFKA_GROUP_ID}-acc-gw-v3`,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: { fromBeginning: true },
    },
  }),
];

@Module({
  imports: [],
  providers: [...epaaLegacyKafkaProviders],
  exports: [...epaaLegacyKafkaProviders.map((p) => p.provide)],
})
export class KafkaEpaaLegacyModule {}
