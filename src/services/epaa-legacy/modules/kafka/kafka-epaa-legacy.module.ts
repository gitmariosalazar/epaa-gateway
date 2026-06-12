import { Module } from '@nestjs/common';
import { provideContextualKafkaClient } from '../../../../shared/kafka/provide-contextual-kafka';
import { environments } from '../../../../settings/environments/environments';
import {
  EPAA_LEGACY_REPLY_TOPIC,
  KAFKA_LEGACY_CONSUMER_OPTIONS,
  KAFKA_RETRY_OPTIONS,
} from './epaa-legacy-kafka.constants';

const epaaLegacyKafkaProviders = [
  // Epaa Legacy Readings Kafka Client
  provideContextualKafkaClient(environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT, {
    replyTopic: EPAA_LEGACY_REPLY_TOPIC,
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      // Adding -gateway avoids collision with the microservice which uses the exact same variable
      clientId: `${environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT_ID}-gw-v3`,
      retry: KAFKA_RETRY_OPTIONS,
    },
    producer: {
      idempotent: true,
    },
    consumer: {
      groupId: `${environments.EPAA_LEGACY_READINGS_KAFKA_GROUP_ID}-gw-v3`,
      ...KAFKA_LEGACY_CONSUMER_OPTIONS,
    },
  }),
  // Epaa Legacy Accounting Kafka Client
  provideContextualKafkaClient('EPAA_LEGACY_ACCOUNTING_KAFKA_CLIENT', {
    replyTopic: EPAA_LEGACY_REPLY_TOPIC,
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: `${environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT_ID}-acc-gw-v3`,
      retry: KAFKA_RETRY_OPTIONS,
    },

    consumer: {
      groupId: `${environments.EPAA_LEGACY_READINGS_KAFKA_GROUP_ID}-acc-gw-v3`,
      ...KAFKA_LEGACY_CONSUMER_OPTIONS,
    },
  }),
];

@Module({
  imports: [],
  providers: [...epaaLegacyKafkaProviders],
  exports: [...epaaLegacyKafkaProviders.map((p) => p.provide)],
})
export class KafkaEpaaLegacyModule {}
