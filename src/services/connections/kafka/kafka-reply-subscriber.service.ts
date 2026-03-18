// src/shared/kafka/kafka-reply-subscriber.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { environments } from '../../../settings/environments/environments'; // ajusta el path si es necesario

@Injectable()
export class KafkaConnectionReplySubscriberService implements OnModuleInit {
  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const connectionReplyPatterns: string[] = [
      'connections.create-connection',
      'connections.update-connection',
      'connections.get-connection-by-id',
      'connections.get-all-connections',
      'connections.delete-connection',
      'connections.verify-connection-exists',
      'connections.find-connection-by-property-cadastral-key',
      'connections.find-connection-with-property-by-cadastral-key',
      'connections.get-all-connections-with-property',
      'connections.get-connections-paginated',
    ];
    const photoConnectionReplyPatterns: string[] = [
      'photo-connection.create-photo-connection',
      'photo-connection.get-photo-connections-by-cadastral-key',
    ];

    const observationConnectionReplyPatterns: string[] = [
      'observation-connection.create-observation-connection',
      'observation-connection.get-observation-connections-by-observation-id',
      'observation-connection.get-observation-connections-by-connection-id',
      'observation-connection.get-all-observation-connections',
    ];

    const rateReplyPatterns: string[] = [
      'rate.create-rate',
      'rate.get-rate-by-id',
      'rates.get-all-current-rates',
      'rate.update-rate',
      'rate.delete-rate',
    ];

    const replyPatterns: string[] = [
      ...connectionReplyPatterns,
      ...photoConnectionReplyPatterns,
      ...observationConnectionReplyPatterns,
      ...rateReplyPatterns,
    ];

    replyPatterns.forEach((pattern) => {
      this.kafkaClient.subscribeToResponseOf(pattern);
    });

    console.log(
      `[KafkaReplySubscriber] Suscrito a ${replyPatterns.length} reply patterns`,
    );

    await this.kafkaClient.connect();
    console.log('[KafkaReplySubscriber] Kafka client conectado');
  }
}
