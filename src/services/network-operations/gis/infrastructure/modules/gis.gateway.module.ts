import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUDIT_REALTIME_NOTIFIER_PORT } from '../../application/ports/audit-realtime-notifier.port';
import { environments } from '../../../../../settings/environments/environments';
import { GisGatewayController } from '../controller/gis.gateway.controller';

@Module({
  imports: [
    /**
     * Owns the canonical GATEWAY_NETWORK_OPERATIONS_KAFKA_CLIENT for the network operations bounded context.
     */
    ClientsModule.register([
      {
        name: environments.GATEWAY_NETWORK_OPERATIONS_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          replyTopic: 'network-operations_topic.reply',
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.GATEWAY_NETWORK_OPERATIONS_KAFKA_CLIENT_ID,
            retry: { retries: 25, initialRetryTime: 1000 },
          },
          consumer: {
            groupId: environments.GATEWAY_NETWORK_OPERATIONS_KAFKA_GROUP_ID,
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
  ],
  controllers: [GisGatewayController],
  providers: [],
  exports: [ClientsModule],
})
export class NetworkOperationsGatewayModule {}
