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
      const client = new ContextualClientKafka(options as any);
      // We must map it because ContextualClientKafka doesn't automatically subscribe 
      // when created manually like ClientsModule does.
      return client;
    },
  };
}
