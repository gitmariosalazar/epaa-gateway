import { Module } from '@nestjs/common';
import { provideContextualKafkaClient } from '../../../../../../shared/kafka/provide-contextual-kafka';
import { environments } from '../../../../../../settings/environments/environments';
import {
  EPAA_LEGACY_REPLY_TOPIC,
  KAFKA_LEGACY_CONSUMER_OPTIONS,
  KAFKA_RETRY_OPTIONS,
} from '../../../kafka/epaa-legacy-kafka.constants';

const trashRateKafkaProvider = provideContextualKafkaClient(
  environments.TRASH_RATE_KAFKA_CLIENT,
  {
    replyTopic: EPAA_LEGACY_REPLY_TOPIC,
    client: {
      brokers: [environments.KAFKA_BROKER_URL],
      clientId: `${environments.TRASH_RATE_KAFKA_CLIENT_ID}-gw-v3`,
      retry: KAFKA_RETRY_OPTIONS,
    },
    producer: { idempotent: true },
    consumer: {
      groupId: `${environments.TRASH_RATE_KAFKA_GROUP_ID}-gw-v3`,
      ...KAFKA_LEGACY_CONSUMER_OPTIONS,
    },
  },
);

@Module({
  imports: [],
  controllers: [],
  providers: [trashRateKafkaProvider],
  exports: [environments.TRASH_RATE_KAFKA_CLIENT],
})
export class KafkaTrashRateModule {}
