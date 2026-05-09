import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environments } from '../../../settings/environments/environments';

@Module({
  imports: [
    ClientsModule.register([
      // Kafka clients can be registered here if needed
      {
        name: environments.GATEWAY_LOCATION_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.GATEWAY_LOCATION_KAFKA_CLIENT_ID,
            retry: { retries: 25, initialRetryTime: 1000 },
          },
          consumer: {
            groupId: environments.GATEWAY_LOCATION_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [ClientsModule],
})
export class KafkaLocationGlobalModule {}
