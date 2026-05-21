import { Module } from '@nestjs/common';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';
import { ConnectionDocumentGatewayController } from '../controllers/connection-document.gateway.controller';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [ConnectionDocumentGatewayController],
  providers: [],
  exports: [],
})
export class ConnectionDocumentGatewayModule {}
// This module can be used to define any shared services, controllers, or providers related to connection documents in the client gateway.
