import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PhotoConnectionGatewayController } from '../controllers/photo-connection.gateway.controller';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';

@Module({
  imports: [
    KafkaConnectionsModule,

  ],
  controllers: [PhotoConnectionGatewayController],
  providers: [],
  exports: [],
})
export class PhotoConnectionGatewayModule {}
