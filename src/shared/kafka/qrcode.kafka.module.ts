import { Module } from '@nestjs/common';
import { environments } from '../../settings/environments/environments';
import { provideContextualKafkaClient } from './provide-contextual-kafka';

const qrcodeKafkaProvider = provideContextualKafkaClient(environments.QRCODE_KAFKA_CLIENT, {
  client: {
    clientId: environments.QRCODE_KAFKA_CLIENT_ID!,
            retry: { retries: 25, initialRetryTime: 1000 },
    brokers: [`${environments.KAFKA_BROKER_URL}`],
  },
  consumer: {
    groupId: environments.QRCODE_KAFKA_GROUP_ID!,
  },
});

@Module({
  imports: [],
  providers: [qrcodeKafkaProvider],
  exports: [qrcodeKafkaProvider.provide],
})
export class QRCodeKafkaModule { }
