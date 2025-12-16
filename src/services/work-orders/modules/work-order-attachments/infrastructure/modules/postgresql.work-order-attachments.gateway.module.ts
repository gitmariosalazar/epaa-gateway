import { Module } from '@nestjs/common';
import { KafkaWorkOrdersModule } from '../../../../kafka/kafka-work_orders.module';
import { WorkOrderAttachmentsGatewayController } from '../controllers/work-order-attachments.gateway.controller';

@Module({
  imports: [KafkaWorkOrdersModule],
  controllers: [WorkOrderAttachmentsGatewayController],
  providers: [],
  exports: [],
})
export class PostgresqlWorkOrderAttachmentsGatewayModule {}
