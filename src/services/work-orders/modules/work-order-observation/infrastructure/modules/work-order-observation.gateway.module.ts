import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { environments } from "../../../../../../settings/environments/environments";

import { WorkOrderObservationGatewayController } from "../controllers/work-order-observation.gateway.controller";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.WORK_ORDER_OBSERVATION_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId:
              environments.WORK_ORDER_OBSERVATION_KAFKA_CLIENT_ID,
            brokers: [environments.KAFKA_BROKER_URL],
          },
          consumer: {
            groupId:
              environments.WORK_ORDER_OBSERVATION_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            allowAutoTopicCreation: true,
            subscribe: {
              fromBeginning: true
            }
          },
        },
      },
    ]),
  ],
  controllers: [WorkOrderObservationGatewayController],
  providers: [],
  exports: [],
})
export class WorkOrderObservationGatewayModule { }