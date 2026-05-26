import { Module } from '@nestjs/common';
import { DocumentsGatewayModule } from '../modules/documents/infrastructure/modules/documents.gateway.module';

@Module({
  imports: [DocumentsGatewayModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class DocumentsFactoryModule {}
