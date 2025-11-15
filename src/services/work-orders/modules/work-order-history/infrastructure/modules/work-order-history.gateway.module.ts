import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { environments } from "../../../../../../settings/environments/environments";
import { WorkOrderHistoryGatewayController } from "../controllers/work-order-history.gateway.controller";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.WORK_HISTORY_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: environments.WORK_HISTORY_KAFKA_CLIENT_ID,
            brokers: [environments.KAFKA_BROKER_URL],
          },
          consumer: {
            groupId: environments.WORK_HISTORY_KAFKA_GROUP_ID,
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
  controllers: [WorkOrderHistoryGatewayController],
  providers: [],
  exports: [ClientsModule],
})
export class WorkOrderHistoryGatewayModule { }