import { Module } from '@nestjs/common';
import { ConnectionGatewayController } from '../controllers/connection.gateway.controller';
import { ConnectionStateGatewayController } from '../controllers/connection-state.gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [ConnectionGatewayController, ConnectionStateGatewayController],
  providers: [],
  exports: [],
})
export class ConnectionGatewayModule {}
