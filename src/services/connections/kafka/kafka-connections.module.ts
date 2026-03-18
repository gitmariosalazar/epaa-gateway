import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environments } from '../../../settings/environments/environments';
import { KafkaConnectionReplySubscriberService } from './kafka-reply-subscriber.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.CONNECTION_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.CONNECTION_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.CONNECTION_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: { fromBeginning: true },
          },
        },
      },
    ]),
  ],
  controllers: [],
  providers: [KafkaConnectionReplySubscriberService],
  exports: [ClientsModule, KafkaConnectionReplySubscriberService],
})
export class KafkaConnectionsModule {}
