import { Module } from '@nestjs/common';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';
import { DocumentValidationGatewayController } from '../controllers/document-validation.gateway.controller';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [DocumentValidationGatewayController],
})
export class DocumentValidationGatewayModule {}
