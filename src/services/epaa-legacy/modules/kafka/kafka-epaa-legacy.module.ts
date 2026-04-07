import { Module } from '@nestjs/common';
import { provideContextualKafkaClient } from '../../../../shared/kafka/provide-contextual-kafka';
import { environments } from '../../../../settings/environments/environments';

const epaaLegacyKafkaProviders = [
  // Epaa Legacy Readings Kafka Client
  provideContextualKafkaClient(environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT, {
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT_ID,
    },
    consumer: {
      groupId: environments.EPAA_LEGACY_READINGS_KAFKA_GROUP_ID,
      sessionTimeout: 60000,
      heartbeatInterval: 5000,
      rebalanceTimeout: 120000,
      subscribe: {
        fromBeginning: true,
      },
    },
  }),
];

@Module({
  imports: [],
  providers: [...epaaLegacyKafkaProviders],
  exports: [...epaaLegacyKafkaProviders.map((p) => p.provide)],
})
export class KafkaEpaaLegacyModule {}
