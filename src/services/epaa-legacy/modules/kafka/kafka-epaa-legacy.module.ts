import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environments } from '../../../../settings/environments/environments';

/**
 * Provides the canonical EPAA_LEGACY_READINGS_KAFKA_CLIENT for the
 * epaa-legacy readings bounded context.
 *
 * Single Responsibility: this module owns legacy-readings Kafka transport only.
 * The trash-rate domain uses its own KafkaTrashRateModule.
 */
@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.EPAA_LEGACY_READINGS_KAFKA_GROUP_ID,
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
export class KafkaEpaaLegacyModule {}
