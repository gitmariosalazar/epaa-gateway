import { Module } from '@nestjs/common';
import { DashboardGatewayController } from '../controller/dashboard.gateway.controller';
import { KafkaWorkOrdersModule } from '../../../../kafka/kafka-work_orders.module';

@Module({
  imports: [KafkaWorkOrdersModule],
  controllers: [DashboardGatewayController],
  providers: [],
  exports: [],
})
export class DashboardGatewayModule {}
