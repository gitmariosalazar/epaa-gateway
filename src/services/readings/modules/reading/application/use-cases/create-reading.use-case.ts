import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { CreateReadingRequest } from '../../domain/schemas/dto/request/create-reading.request';
import { ReadingResponse } from '../../domain/schemas/dto/response/reading.response';
import { ReadingLegacyMapper } from '../../domain/services/reading-legacy.mapper';
import {
  IReadingLegacySyncPort,
  READING_LEGACY_SYNC_PORT,
} from '../ports/reading-legacy-sync.port';
import {
  IReadingRealtimeNotifierPort,
  READING_REALTIME_NOTIFIER_PORT,
} from '../ports/reading-realtime-notifier.port';

/**
 * CreateReadingUseCase — application layer orchestrator (SRP + DIP).
 * Coordinates the primary "create reading" command and its secondary,
 * fire-and-forget side effects (legacy sync, realtime broadcast) through
 * output ports, without knowing their concrete (Kafka/WebSocket) implementation.
 */
@Injectable()
export class CreateReadingUseCase {
  private readonly logger = new Logger(CreateReadingUseCase.name);

  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
    @Inject(READING_LEGACY_SYNC_PORT)
    private readonly legacySync: IReadingLegacySyncPort,
    @Inject(READING_REALTIME_NOTIFIER_PORT)
    private readonly realtimeNotifier: IReadingRealtimeNotifierPort,
  ) {}

  async execute(
    readingRequest: CreateReadingRequest,
    creatorUserId: string | undefined,
    username: string | undefined,
  ): Promise<ReadingResponse> {
    const response = await sendKafkaRequest<ReadingResponse>(
      this.kafkaProxy.send(this.readingClient, 'reading.create-reading', {
        ...readingRequest,
        creatorUserId,
      }),
    );

    if (!response) {
      throw new RpcException({
        statusCode: 500,
        message: 'Failed to create reading',
      });
    }

    const legacyReading = ReadingLegacyMapper.toCreateReadingLegacyRequest(
      response,
      username,
    );
    this.legacySync.syncCreateReadingLegacy(legacyReading);
    this.realtimeNotifier.notifyReadingCreated(response.sector ?? 0);

    return response;
  }
}
