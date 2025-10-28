import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { MulterModule } from "@nestjs/platform-express";
import { PhotoReadingGatewayController } from "../controllers/photo-reading.gateway.controller";
import { ServeStaticModule } from "@nestjs/serve-static";
import { environments } from "../../../../../../settings/environments/environments";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.PHOTO_READING_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL!],
          },
          consumer: {
            groupId: environments.PHOTO_READING_KAFKA_GROUP_ID!,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true
            }
          },
        },
      },
    ]),
    MulterModule.register({ dest: '/home/sigepaa/sigepaa/images/readings' }),
    ServeStaticModule.forRoot({
      rootPath: '/home/sigepaa/sigepaa/images/readings',
      serveRoot: '/images/readings',
      serveStaticOptions: {
        index: false,
        redirect: false,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: '/home/sigepaa/sigepaa/images/qrcodes',
      serveRoot: '/images/qrcodes',
      serveStaticOptions: {
        index: false,
        redirect: false,
      },
    }),
  ],
  controllers: [
    PhotoReadingGatewayController
  ],
  providers: [],
  exports: [MulterModule, ClientsModule, ServeStaticModule],
})
export class PhotoReadingGatewayModule { }