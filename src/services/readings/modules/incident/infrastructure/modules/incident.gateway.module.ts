import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { IncidentGatewayController } from '../controller/incident.gateway.controller';
import { environments } from '../../../../../../settings/environments/environments';

const INCIDENT_IMAGES_DIR = '/home/sigepaa/sigepaa/images/incidents';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.INCIDENT_KAFKA_CLIENT!,
        transport: Transport.KAFKA,
        options: {
          replyTopic: 'readings_topic.reply',
          client: {
            brokers: [environments.KAFKA_BROKER_URL],
            clientId: environments.INCIDENT_KAFKA_CLIENT_ID,
          },
          consumer: {
            groupId: environments.INCIDENT_KAFKA_GROUP_ID,
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
    MulterModule.register({ dest: INCIDENT_IMAGES_DIR }),
    ServeStaticModule.forRoot({
      rootPath: INCIDENT_IMAGES_DIR,
      serveRoot: '/images/incidents',
      serveStaticOptions: {
        index: false,
        redirect: false,
      },
    }),
  ],
  controllers: [IncidentGatewayController],
  providers: [],
  exports: [ClientsModule],
})
export class IncidentGatewayModule {}
