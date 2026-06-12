import { Module } from '@nestjs/common';
import { KafkaWorkOrdersModule } from '../../../../kafka/kafka-work_orders.module';
import { ProcessWorkOrderGatewayController } from '../controllers/process-work-order.gateway.controller';

@Module({
  imports: [KafkaWorkOrdersModule],
  controllers: [ProcessWorkOrderGatewayController],
  providers: [],
  exports: [],
})
export class ProcessWorkOrderGatewayModule {}
