import { Module } from '@nestjs/common';
import { provideContextualKafkaClient } from '../../../shared/kafka/provide-contextual-kafka';
import { environments } from '../../../settings/environments/environments';

const connectionKafkaClient = provideContextualKafkaClient(
  environments.CONNECTION_KAFKA_CLIENT,
  {
    replyTopic: 'connection_topic.reply',
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: environments.CONNECTION_KAFKA_CLIENT_ID,
      retry: { retries: 25, initialRetryTime: 1000 },
    },
    consumer: {
      groupId: environments.CONNECTION_KAFKA_GROUP_ID,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      rebalanceTimeout: 60000,
      subscribe: { fromBeginning: true },
    },
  },
);

@Module({
  imports: [],
  controllers: [],
  providers: [connectionKafkaClient],
  exports: [connectionKafkaClient],
})
export class KafkaConnectionsModule {}
