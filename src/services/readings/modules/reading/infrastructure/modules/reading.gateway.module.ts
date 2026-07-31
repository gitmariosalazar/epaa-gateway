import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReadingGatewayController } from '../controller/reading.gateway.controller';
import { environments } from '../../../../../../settings/environments/environments';
import { ReadingReportDashboardGatewayController } from '../controller/reading.report-dashboard.gateway.controller';
import { ReadingImagesGatewayController } from '../controller/reading-images.gateway.controller';
import { KafkaEpaaLegacyModule } from '../../../../../../services/epaa-legacy/modules/kafka/kafka-epaa-legacy.module';
import { ReadingAuditGatewayController } from '../controller/reading-audit.gateway.controller';
import { CreateReadingUseCase } from '../../application/use-cases/create-reading.use-case';
import { UpdateCurrentReadingUseCase } from '../../application/use-cases/update-current-reading.use-case';
import { READING_LEGACY_SYNC_PORT } from '../../application/ports/reading-legacy-sync.port';
import { READING_REALTIME_NOTIFIER_PORT } from '../../application/ports/reading-realtime-notifier.port';
import { KafkaReadingLegacySyncAdapter } from '../adapters/kafka-reading-legacy-sync.adapter';
import { RealtimeReadingNotifierAdapter } from '../adapters/realtime-reading-notifier.adapter';

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
          replyTopic: 'readings_topic.reply',
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.READINGS_KAFKA_CLIENT_ID,
            retry: { retries: 25, initialRetryTime: 1000 },
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
    ReadingAuditGatewayController,
  ],
  providers: [
    // RealtimeService se inyecta directamente desde el RealtimeModule global
    // sin necesidad de registrar ReadingsWebsocketGateway aquí.
    CreateReadingUseCase,
    UpdateCurrentReadingUseCase,
    {
      provide: READING_LEGACY_SYNC_PORT,
      useClass: KafkaReadingLegacySyncAdapter,
    },
    {
      provide: READING_REALTIME_NOTIFIER_PORT,
      useClass: RealtimeReadingNotifierAdapter,
    },
  ],
  exports: [ClientsModule],
})
export class ReadingGatewayModule {}
