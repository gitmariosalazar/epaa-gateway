import { Module } from '@nestjs/common';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';
import { InspectionOrderGatewayController } from '../controllers/inspection-order.gateway.controller';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [InspectionOrderGatewayController],
})
export class InspectionOrderGatewayModule {}
