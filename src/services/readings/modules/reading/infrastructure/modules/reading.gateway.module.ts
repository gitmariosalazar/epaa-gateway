import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReadingGatewayController } from '../controller/reading.gateway.controller';
import { environments } from '../../../../../../settings/environments/environments';
import { ReadingReportDashboardGatewayController } from '../controller/reading.report-dashboard.gateway.controller';
import { ReadingImagesGatewayController } from '../controller/reading-images.gateway.controller';
import { KafkaEpaaLegacyModule } from '../../../../../../services/epaa-legacy/modules/kafka/kafka-epaa-legacy.module';

@Module({
  imports: [
    /**
     * Owns the canonical READINGS_KAFKA_CLIENT for the readings bounded context.
     */
    ClientsModule.register([
      {
        name: environments.READINGS_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.READINGS_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.READINGS_KAFKA_GROUP_ID,
            sessionTimeout: 60000,
            heartbeatInterval: 5000,
            rebalanceTimeout: 120000,
            subscribe: { fromBeginning: true },
          },
        },
      },
    ]),
    /**
     * Provides the shared EPAA_LEGACY_READINGS_KAFKA_CLIENT from the canonical
     * epaa-legacy Kafka module. Importing this module (instead of registering a
     * second instance) ensures a single ClientKafka instance handles all reply-
     * topic subscriptions, preventing the
     * "did not subscribe to the corresponding reply topic" error.
     */
    KafkaEpaaLegacyModule,
  ],
  controllers: [
    ReadingGatewayController,
    ReadingReportDashboardGatewayController,
    ReadingImagesGatewayController,
  ],
  providers: [],
  exports: [ClientsModule],
})
export class ReadingGatewayModule {}
