import { Module } from '@nestjs/common';
import { WorkOrderGatewayController } from '../controller/work-order.gateway.controller';
import { KafkaWorkOrdersModule } from '../../../../kafka/kafka-work_orders.module';
@Module({
  imports: [KafkaWorkOrdersModule],
  controllers: [WorkOrderGatewayController],
  providers: [],
  exports: [],
})
export class WorkOrderGatewayModule {}
