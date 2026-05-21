import { Module } from '@nestjs/common';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';
import { InspectionReportGatewayController } from '../controllers/inspection-report.gateway.controller';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [InspectionReportGatewayController],
})
export class InspectionReportGatewayModule {}
