import { Module } from '@nestjs/common';
import { RateGatewayController } from '../controllers/rate.gateway.controller';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [RateGatewayController],
  providers: [],
  exports: [],
})
export class RateGatewayModule {}
