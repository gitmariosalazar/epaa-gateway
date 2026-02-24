import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReadingGatewayController } from '../controller/reading.gateway.controller';
import { environments } from '../../../../../../settings/environments/environments';
import { ReadingReportDashboardGatewayController } from '../controller/reading.report-dashboard.gateway.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.READINGS_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [`${environments.KAFKA_BROKER_URL}`],
          },
          consumer: {
            groupId: environments.READINGS_KAFKA_GROUP_ID,
            sessionTimeout: 60000, // Increased to 60s
            heartbeatInterval: 5000, // More frequent heartbeats
            rebalanceTimeout: 120000, // Allow more time for rebalance
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },
    ]),
    ClientsModule.register([
      {
        name: environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [`${environments.KAFKA_BROKER_URL}`],
          },
          consumer: {
            groupId: environments.EPAA_LEGACY_READINGS_KAFKA_GROUP_ID,
            sessionTimeout: 60000, // Increased to 60s
            heartbeatInterval: 5000, // More frequent heartbeats
            rebalanceTimeout: 120000, // Allow more time for rebalance
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },
    ]),
  ],
  controllers: [
    ReadingGatewayController,
    ReadingReportDashboardGatewayController,
  ],
  providers: [],
  exports: [ClientsModule],
})
export class ReadingGatewayModule {}
