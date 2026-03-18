import { Module } from '@nestjs/common';
import { ConnectionGatewayController } from '../controllers/connection.gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [ConnectionGatewayController],
  providers: [],
  exports: [],
})
export class ConnectionGatewayModule {}
