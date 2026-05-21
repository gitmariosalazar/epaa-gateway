import { Module } from '@nestjs/common';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';
import { CadastralGatewayController } from '../controllers/cadastral.gateway.controller';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [CadastralGatewayController],
})
export class CadastralGatewayModule {}
