import { Module } from "@nestjs/common";
import { ConnectionGatewayController } from "../controllers/connection.gateway.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { environments } from "../../../../../../settings/environments/environments";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.CONNECTION_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [`${environments.KAFKA_BROKER_URL}`],
          },
          consumer: {
            groupId: environments.CONNECTION_KAFKA_GROUP_ID,
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
  controllers: [ConnectionGatewayController],
  providers: [],
  exports: [ClientsModule]
})
export class ConnectionGatewayModule { }