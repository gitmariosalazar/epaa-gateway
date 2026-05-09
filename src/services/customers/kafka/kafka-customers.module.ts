import { Module } from '@nestjs/common';
import { environments } from '../../../settings/environments/environments';
import { provideContextualKafkaClient } from '../../../shared/kafka/provide-contextual-kafka';
import { KafkaReplySubscriberService } from './kafka-reply-subscriber.service';

const customerKafkaProviders = [
  provideContextualKafkaClient(environments.CLIENTS_KAFKA_CLIENT, {
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: environments.CLIENTS_KAFKA_CLIENT_ID,
            retry: { retries: 25, initialRetryTime: 1000 },
    },
    consumer: {
      groupId: environments.CLIENTS_KAFKA_GROUP_ID,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: {
        fromBeginning: true,
      },
    },
  }),
];

@Module({
  imports: [],
  providers: [...customerKafkaProviders, KafkaReplySubscriberService],
  exports: [...customerKafkaProviders.map((p) => p.provide)],
})
export class KafkaCustomersModule {}
