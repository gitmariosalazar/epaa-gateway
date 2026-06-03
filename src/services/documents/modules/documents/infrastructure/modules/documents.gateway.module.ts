import { Module } from '@nestjs/common';
import { KafkaDocumentsModule } from '../../../../kafka/kafka-connections.module';
import { DocumentsGatewayController } from '../controller/documents.gateway.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { environments } from '../../../../../../settings/environments/environments';
import * as path from 'path';

@Module({
  imports: [
    KafkaDocumentsModule,
    ServeStaticModule.forRoot({
      rootPath: path.dirname(environments.CONNECTION_DOCUMENTS_UPLOAD_DIR),
      serveRoot: '/uploads',
      serveStaticOptions: { index: false, redirect: false },
    }),
  ],
  controllers: [DocumentsGatewayController],
  providers: [],
})
export class DocumentsGatewayModule {}
