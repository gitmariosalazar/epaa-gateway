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
      // If no replyTopic is provided, we try to guess it or use a default
      // to avoid the "not subscribed to reply topic" error.
      const kafkaOptions = options as any;
      if (!kafkaOptions.replyTopic) {
        // Default to a topic based on the token if possible
        const guessedTopic = token.toLowerCase().replace('_kafka_client', '') + '_topic.reply';
        kafkaOptions.replyTopic = guessedTopic;
      }
      
      const client = new ContextualClientKafka(kafkaOptions);
      // We must map it because ContextualClientKafka doesn't automatically subscribe 
      // when created manually like ClientsModule does.
      return client;
    },
  };
}
