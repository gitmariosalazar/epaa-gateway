import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';

/**
 * Provides the canonical TRASH_RATE_KAFKA_CLIENT for the trash-rate bounded
 * context. Registering the client here — and only here — ensures a single
 * ClientKafka instance is responsible for subscribing reply topics, which
 * prevents the "did not subscribe to the corresponding reply topic" error.
 *
 * Single Responsibility: this module owns the trash-rate Kafka transport only.
 */
@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.TRASH_RATE_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.TRASH_RATE_KAFKA_CLIENT_ID,
            retry: { retries: 25, initialRetryTime: 1000 },
          },
          consumer: {
            groupId: environments.TRASH_RATE_KAFKA_GROUP_ID,
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
  providers: [],
  exports: [ClientsModule],
})
export class KafkaTrashRateModule {}
