import { Module } from '@nestjs/common';
import { WorkOrderHistoryGatewayController } from '../controllers/work-order-history.gateway.controller';
import { KafkaWorkOrdersModule } from '../../../../kafka/kafka-work_orders.module';

@Module({
  imports: [KafkaWorkOrdersModule],
  controllers: [WorkOrderHistoryGatewayController],
  providers: [],
  exports: [],
})
export class WorkOrderHistoryGatewayModule {}
