import { Module } from '@nestjs/common';
import { KafkaDocumentsModule } from '../../../../kafka/kafka-connections.module';
import { DocumentsGatewayController } from '../controller/documents.gateway.controller';

@Module({
  imports: [KafkaDocumentsModule],
  controllers: [DocumentsGatewayController],
  providers: [],
})
export class DocumentsGatewayModule {}
