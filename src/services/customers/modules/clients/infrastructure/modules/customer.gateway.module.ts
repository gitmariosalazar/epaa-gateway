import { Module } from "@nestjs/common";
import { CustomerGatewayController } from "../controllers/customer.gateway.controller";
import { environments } from "src/settings/environments/environments";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.CUSTOMERS_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [`${environments.KAFKA_BROKER_URL}`],
          },
          consumer: {
            groupId: environments.CUSTOMERS_KAFKA_GROUP_ID,
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
  controllers: [CustomerGatewayController],
  providers: [],
  exports: [ClientsModule],
})
export class CustomerGatewayModule { }