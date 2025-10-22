import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { environments } from "src/settings/environments/environments";
import { ReadingLegacyGatewayController } from "../controller/reading-legacy.gateway.controller";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.EPAA_LEGACY_READINGS_KAFKA_GROUP_ID,
            allowAutoTopicCreation: true,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true
            }
          },
        }
      }
    ]),
  ],
  controllers: [ReadingLegacyGatewayController],
  providers: [],
  exports: [ClientsModule],

})
export class ReadingLegacyModule { }