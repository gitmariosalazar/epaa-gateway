import { Module } from '@nestjs/common';
import { WorkOrderObservationGatewayController } from '../controllers/work-order-observation.gateway.controller';
import { KafkaWorkOrdersModule } from '../../../../kafka/kafka-work_orders.module';

@Module({
  imports: [KafkaWorkOrdersModule],
  controllers: [WorkOrderObservationGatewayController],
  providers: [],
  exports: [],
})
export class WorkOrderObservationGatewayModule {}
