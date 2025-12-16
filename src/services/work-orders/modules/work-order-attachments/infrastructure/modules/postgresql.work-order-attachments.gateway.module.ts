import { Module } from '@nestjs/common';
import { KafkaWorkOrdersModule } from '../../../../kafka/kafka-work_orders.module';
import { WorkOrderAttachmentsGatewayController } from '../controllers/work-order-attachments.gateway.controller';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [KafkaWorkOrdersModule, ServeStaticModule.forRoot(
    ...[
      {
        rootPath: '/home/sigepaa/sigepaa/images/work_orders',
        serveRoot: '/images/work_orders',
         serveStaticOptions: { index: false, redirect: false },
      }
    ]
  )],
  controllers: [WorkOrderAttachmentsGatewayController],
  providers: [],
  exports: [],
})
export class PostgresqlWorkOrderAttachmentsGatewayModule {}
