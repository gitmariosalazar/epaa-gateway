// src/shared/kafka/kafka-reply-subscriber.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { environments } from '../../../settings/environments/environments'; // ajusta el path si es necesario

@Injectable()
export class KafkaReplySubscriberService implements OnModuleInit {
  constructor(
    @Inject(environments.CLIENTS_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const replyPatterns = [
      // Companies
      'companies.create-company',
      'companies.update-company',
      'companies.get-company-by-ruc',
      'companies.get-all-companies',
      'companies.delete-company',
      'companies.verify-company-exists',
      // Customers
      'customers.create-customer',
      'customers.update-customer',
      'customers.delete-customer',
      'customers.get-customer-by-id',
      'customers.get-all-customers',
      'customers.verify-customer-exists',

      // General Customers
      'customers.get-general-customers',
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
