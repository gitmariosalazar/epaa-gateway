import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { ObservationConnectionGatewayController } from '../controllers/observation-connection.gateway.controller';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [ObservationConnectionGatewayController],
  providers: [],
  exports: [],
})
export class ObservationConnectionGatewayModule {}
