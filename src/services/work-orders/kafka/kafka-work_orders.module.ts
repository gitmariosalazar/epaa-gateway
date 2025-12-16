import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environments } from '../../../settings/environments/environments';

@Module({
  imports: [
    ClientsModule.register([
      // Kafka clients can be registered here if needed
      {
        name: environments.GATEWAY_WORK_ORDER_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.GATEWAY_WORK_ORDER_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.GATEWAY_WORK_ORDER_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },

      {
        name: environments.GATEWAY_WORK_ORDER_OBSERVATION_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId:
              environments.GATEWAY_WORK_ORDER_OBSERVATION_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.GATEWAY_WORK_ORDER_OBSERVATION_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },

      {
        name: environments.GATEWAY_WORK_TYPE_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.GATEWAY_WORK_TYPE_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.GATEWAY_WORK_TYPE_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },

      {
        name: environments.GATEWAY_WORK_ORDER_HISTORY_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.GATEWAY_WORK_ORDER_HISTORY_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.GATEWAY_WORK_ORDER_HISTORY_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },
      {
        name: environments.GATEWAY_DETAIL_WORK_ORDER_MATERIAL_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId:
              environments.GATEWAY_DETAIL_WORK_ORDER_MATERIAL_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId:
              environments.GATEWAY_DETAIL_WORK_ORDER_MATERIAL_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },
      {
        name: environments.GATEWAY_WORK_ORDER_WORKER_ASSIGNMENT_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId:
              environments.GATEWAY_WORK_ORDER_WORKER_ASSIGNMENT_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId:
              environments.GATEWAY_WORK_ORDER_WORKER_ASSIGNMENT_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },
      {
        name: environments.GATEWAY_WORK_ORDER_ATTACHMENTS_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId:
              environments.GATEWAY_WORK_ORDER_ATTACHMENTS_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.GATEWAY_WORK_ORDER_ATTACHMENTS_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
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
  controllers: [],
  providers: [],
  exports: [ClientsModule],
})
export class KafkaWorkOrdersModule {}
