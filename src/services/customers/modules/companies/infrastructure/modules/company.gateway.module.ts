import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { environments } from "../../../../../../settings/environments/environments";
import { CompanyGatewayController } from "../controllers/company.gateway.controller";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.COMPANIES_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [`${environments.KAFKA_BROKER_URL}`],
          },
          consumer: {
            groupId: environments.COMPANIES_KAFKA_GROUP_ID,
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
  controllers: [CompanyGatewayController],
  providers: [],
  exports: [ClientsModule]
})
export class CompanyGatewayModule { }