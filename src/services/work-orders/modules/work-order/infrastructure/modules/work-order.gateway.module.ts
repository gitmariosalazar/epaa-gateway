import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { environments } from "../../../../../../settings/environments/environments";
import { WorkOrderGatewayController } from "../controller/work-order.gateway.controller";
@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.WORK_ORDER_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.WORK_ORDER_KAFKA_CLIENT_ID
          },
          consumer: {
            groupId: environments.WORK_ORDER_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true
            }
          }
        }
      }
    ]),
  ],
  controllers: [WorkOrderGatewayController],
  providers: [],
  exports: [ClientsModule],
})
export class WorkOrderGatewayModule { }