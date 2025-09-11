import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environments } from 'src/settings/environments/environments';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.QRCODE_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: environments.QRCODE_KAFKA_CLIENT_ID!,
            brokers: [`${environments.KAFKA_BROKER_URL}`],
          },
          consumer: {
            groupId: environments.QRCODE_KAFKA_GROUP_ID!,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class QRCodeKafkaModule { }
