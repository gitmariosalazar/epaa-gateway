import { Module } from '@nestjs/common';
import { environments } from '../../../settings/environments/environments';
import { provideContextualKafkaClient } from '../../../shared/kafka/provide-contextual-kafka';

const customerKafkaProviders = [
  provideContextualKafkaClient(environments.CLIENTS_KAFKA_CLIENT, {
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: environments.CLIENTS_KAFKA_CLIENT_ID,
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
  providers: [...customerKafkaProviders],
  exports: [...customerKafkaProviders.map((p) => p.provide)],
})
export class KafkaCustomersModule {}
