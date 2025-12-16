import { Module } from '@nestjs/common';
import { KafkaWorkOrdersModule } from '../../../../kafka/kafka-work_orders.module';
import { DetailWorkOrderMaterialGatewayController } from '../controllers/detail-work-order-material.gateway.controller';

@Module({
  imports: [KafkaWorkOrdersModule],
  controllers: [DetailWorkOrderMaterialGatewayController],
  providers: [],
  exports: [],
})
export class DetailWorkOrderMaterialGatewayModule {}
