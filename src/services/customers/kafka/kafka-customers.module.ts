import { Module } from '@nestjs/common';
import { environments } from '../../../settings/environments/environments';
import { provideContextualKafkaClient } from '../../../shared/kafka/provide-contextual-kafka';


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
  provideContextualKafkaClient(environments.COMPANIES_KAFKA_CLIENT, {
    options: { consumer: { replyTopic: 'companies_topic.reply' } },
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: environments.COMPANIES_KAFKA_CLIENT_ID,
            retry: { retries: 25, initialRetryTime: 1000 },
    },
    consumer: {
      groupId: environments.COMPANIES_KAFKA_GROUP_ID,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: { fromBeginning: true },
    },
  }),
];

@Module({
  imports: [],
  providers: [...customerKafkaProviders],
  exports: [...customerKafkaProviders.map((p) => p.provide)],
})
export class KafkaCustomersModule {}
