import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { environments } from "../../../../../../settings/environments/environments";
import { ObservationConnectionGatewayController } from "../controllers/observation-connection.gateway.controller";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.OBSERVATION_CONNECTION_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [`${environments.KAFKA_BROKER_URL}`],
          },
          consumer: {
            groupId: environments.OBSERVATION_CONNECTION_KAFKA_GROUP_ID,
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
  controllers: [ObservationConnectionGatewayController],
  providers: [],
  exports: [ClientsModule]
})
export class ObservationConnectionGatewayModule { }