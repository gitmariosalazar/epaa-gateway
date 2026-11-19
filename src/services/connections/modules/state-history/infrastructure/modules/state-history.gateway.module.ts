import { Module } from '@nestjs/common';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';
import { StateHistoryGatewayController } from '../controllers/state-history.gateway.controller';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [StateHistoryGatewayController],
})
export class StateHistoryGatewayModule {}
