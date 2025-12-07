import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environments } from '../../../../../settings/environments/environments';
import { InventoryGatewayController } from '../infrastructure/controllers/inventory.gateway.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.INVENTORY_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
          },
          consumer: {
            groupId: environments.INVENTORY_KAFKA_GROUP_ID,
            allowAutoTopicCreation: true,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },
    ]),
  ],
  controllers: [InventoryGatewayController],
  providers: [],
  exports: [ClientsModule],
})
export class InventoryGatewayModule {}
