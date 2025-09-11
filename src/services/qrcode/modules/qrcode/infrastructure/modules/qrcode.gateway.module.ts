import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { environments } from "src/settings/environments/environments";
import { QRCodeGatewayController } from "../controller/qrcode.gateway.controller";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.QRCODE_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [`${environments.KAFKA_BROKER_URL}`],
          },
          consumer: {
            groupId: environments.QRCODE_KAFKA_GROUP_ID,
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
  ],
  controllers: [QRCodeGatewayController],
  providers: [],
  exports: [ClientsModule],
})
export class QRCodeGatewayModule { }