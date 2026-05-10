// src/shared/kafka/kafka-reply-subscriber.service.ts
import { Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { environments } from '../../../settings/environments/environments'; // ajusta el path si es necesario

@Injectable()
export class KafkaConnectionReplySubscriberService {
  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  }
