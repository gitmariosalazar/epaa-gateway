import { Module } from '@nestjs/common';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';
import { RequestGatewayController } from '../controller/request.gateway.controller';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [RequestGatewayController],
  providers: [],
  exports: [],
})
export class RequestGatewayModule {}
