import { Module } from '@nestjs/common';
import { WorkTypeGatewayController } from '../controllers/work-type.gateway.controller';
import { KafkaWorkOrdersModule } from '../../../../kafka/kafka-work_orders.module';

@Module({
  imports: [KafkaWorkOrdersModule],
  controllers: [WorkTypeGatewayController],
  providers: [],
  exports: [],
})
export class WorkTypeGatewayModule {}
