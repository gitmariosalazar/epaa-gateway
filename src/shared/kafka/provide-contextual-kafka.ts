import { ClientKafka, ClientOptions, Transport } from '@nestjs/microservices';
import { ContextualClientKafka } from './contextual-client-kafka';

/**
 * Utility to provide a ContextualClientKafka for a given token and options.
 * This ensures that all Kafka messages sent from the gateway automatically
 * include the user's identity in the Kafka headers.
 */
export function provideContextualKafkaClient(
  token: string,
  options: ClientOptions['options'],
) {
  return {
    provide: token,
    useFactory: () => {
      const kafkaOptions = options as any;

      // Extract replyTopic if present and ensure it's in the right place
      const replyTopic =
        kafkaOptions.replyTopic ||
        kafkaOptions.options?.consumer?.replyTopic ||
        kafkaOptions.consumer?.replyTopic ||
        token.toLowerCase().replace('_kafka_client', '') + '_topic.reply';

      // Build proper ClientKafka options
      const clientKafkaOptions = {
        client: kafkaOptions.client,
        consumer: {
          ...kafkaOptions.consumer,
          replyTopic, // replyTopic goes in consumer
        },
        run: kafkaOptions.run,
      };

      const client = new ContextualClientKafka(clientKafkaOptions);

      // CRITICAL: subscribeToResponseOf MUST be called before the first connect().
      // The replyTopic is derived from the topic name (e.g. 'authentication_topic.reply').
      // When connect() is later called (in onModuleInit), the consumer will
      // automatically subscribe to this reply topic.
      const baseTopic = replyTopic.replace('.reply', '');
      client.subscribeToResponseOf(baseTopic);

      return client;
    },
  };
}
