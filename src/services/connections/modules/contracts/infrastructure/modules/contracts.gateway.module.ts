import { Module } from '@nestjs/common';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';
import { ContractsGatewayController } from '../controllers/contracts.gateway.controller';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [ContractsGatewayController],
})
export class ContractsGatewayModule {}
