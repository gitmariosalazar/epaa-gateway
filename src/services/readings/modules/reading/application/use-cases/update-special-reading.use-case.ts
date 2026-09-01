import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { UpdateSpecialReadingRequest } from '../../domain/schemas/dto/request/update-special-reading.request';
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

@Injectable()
export class UpdateSpecialReadingUseCase {
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
    readingId: string,
    readingRequest: UpdateSpecialReadingRequest,
    updateUserId: string | undefined,
    username: string | undefined,
    readingMonth: string, // We might need to pass this explicitly if it's not in the request
  ): Promise<ReadingResponse> {
    const response = await sendKafkaRequest<ReadingResponse>(
      this.kafkaProxy.send(
        this.readingClient,
        'reading.update-special-reading',
        { readingId, readingRequest, updateUserId },
      ),
    );

    const { request, params } =
      ReadingLegacyMapper.toUpdateReadingLegacyContext(
        response,
        readingMonth,
        username,
      );
    console.log(params);
    this.legacySync.syncUpdateSpecialReadingLegacy(params, request);
    this.realtimeNotifier.notifyReadingUpdated(
      response.sector ?? 0,
      readingMonth,
    );

    return response;
  }
}
