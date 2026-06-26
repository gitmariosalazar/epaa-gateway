import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { MulterModule } from "@nestjs/platform-express";
import { PhotoReadingGatewayController } from "../controllers/photo-reading.gateway.controller";
import { environments } from "../../../../../../settings/environments/environments";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.PHOTO_READING_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          replyTopic: 'readings_topic.reply',
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
  ],
  controllers: [
    PhotoReadingGatewayController
  ],
  providers: [],
  exports: [MulterModule, ClientsModule],
})
export class PhotoReadingGatewayModule { }