import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PhotoConnectionGatewayController } from '../controllers/photo-connection.gateway.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';

@Module({
  imports: [
    KafkaConnectionsModule,

    ServeStaticModule.forRoot(
      ...[
        {
          rootPath: '/home/sigepaa/sigepaa/images/connections',
          serveRoot: '/images/connections',
          serveStaticOptions: { index: false, redirect: false },
        },
        {
          rootPath: '/home/sigepaa/sigepaa/images/qrcodes',
          serveRoot: '/images/qrcodes',
          serveStaticOptions: { index: false, redirect: false },
        },
      ],
    ),
  ],
  controllers: [PhotoConnectionGatewayController],
  providers: [],
  exports: [ServeStaticModule],
})
export class PhotoConnectionGatewayModule {}
