import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environments } from '../../../settings/environments/environments';

@Module({
  imports: [
    ClientsModule.register([
      // Kafka clients can be registered here if needed
      {
        name: environments.GATEWAY_AUTHENTICATION_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.GATEWAY_AUTHENTICATION_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.GATEWAY_AUTHENTICATION_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },
      // Roles Kafka Client
      {
        name: environments.GATEWAY_ROLES_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.GATEWAY_ROLES_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.GATEWAY_ROLES_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },
      // Categories Kafka Client
      {
        name: environments.GATEWAY_CATEGORIES_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.GATEWAY_CATEGORIES_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.GATEWAY_CATEGORIES_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },

      // Permissions Kafka Client
      {
        name: environments.GATEWAY_PERMISSIONS_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.GATEWAY_PERMISSIONS_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.GATEWAY_PERMISSIONS_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },
      // Rol-Permission Kafka Client
      {
        name: environments.GATEWAY_ROL_PERMISSION_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.GATEWAY_ROL_PERMISSION_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.GATEWAY_ROL_PERMISSION_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },
      // Users Kafka Client
      {
        name: environments.GATEWAY_USERS_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.GATEWAY_USERS_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.GATEWAY_USERS_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },
      // Employees Kafka Client
      {
        name: environments.GATEWAY_EMPLOYEES_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.GATEWAY_EMPLOYEES_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.GATEWAY_EMPLOYEES_KAFKA_GROUP_ID,
            sessionTimeout: 30000,
            heartbeatInterval: 10000,
            rebalanceTimeout: 60000,
            subscribe: {
              fromBeginning: true,
            },
          },
        },
      },
      // Auth Kafka Client
      {
        name: environments.GATEWAY_AUTH_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.GATEWAY_AUTH_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.GATEWAY_AUTH_KAFKA_GROUP_ID,
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
export class KafkaAuthenticationModule {}
