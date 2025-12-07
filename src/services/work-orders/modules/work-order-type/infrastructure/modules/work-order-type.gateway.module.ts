import { Module } from '@nestjs/common';
import { WorkOrderTypeGatewayController } from '../controllers/work-order-type.gateway.controller';
import { KafkaWorkOrdersModule } from '../../../../kafka/kafka-work_orders.module';

@Module({
  imports: [KafkaWorkOrdersModule],
  controllers: [WorkOrderTypeGatewayController],
  providers: [],
  exports: [],
})
export class WorkOrderTypeGatewayModule {}
