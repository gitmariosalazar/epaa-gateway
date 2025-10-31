import { Module } from "@nestjs/common";
import { PropertyGatewayController } from "../controllers/property.gateway.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { environments } from "../../../../../../settings/environments/environments";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.PROPERTY_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [`${environments.KAFKA_BROKER_URL}`],
          },
          consumer: {
            groupId: environments.PROPERTY_KAFKA_GROUP_ID,
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
  controllers: [PropertyGatewayController],
  providers: [],
  exports: [ClientsModule]
})
export class PropertyGatewayModule { }