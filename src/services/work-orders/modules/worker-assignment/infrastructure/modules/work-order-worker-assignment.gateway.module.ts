import { Module } from '@nestjs/common';
import { KafkaWorkOrdersModule } from '../../../../kafka/kafka-work_orders.module';
import { WorkOrderWorkerAssignmentGatewayController } from '../controllers/work-order-worker-assignment.gateway.controller';

@Module({
  imports: [KafkaWorkOrdersModule],
  controllers: [WorkOrderWorkerAssignmentGatewayController],
  providers: [],
  exports: [],
})
export class WorkOrderWorkerAssignmentGatewayModule {}
