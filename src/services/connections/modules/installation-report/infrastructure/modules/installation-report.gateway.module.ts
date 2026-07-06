import { Module } from '@nestjs/common';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';
import { InstallationReportGatewayController } from '../controllers/installation-report.gateway.controller';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [InstallationReportGatewayController],
})
export class InstallationReportGatewayModule {}
