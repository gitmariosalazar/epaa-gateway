import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { CreateReadingLegacyRequest } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/create.reading-legacy.request';
import { UpdateReadingLegacyRequest } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/update.reading.request';
import { FindCurrentReadingParams } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/find-current-reading-params';
import { IReadingLegacySyncPort } from '../../application/ports/reading-legacy-sync.port';

/**
 * KafkaReadingLegacySyncAdapter — infrastructure adapter (DIP/OCP).
 * FIRE-AND-FORGET: a legacy sync failure must never fail the primary reading flow.
 */
@Injectable()
export class KafkaReadingLegacySyncAdapter implements IReadingLegacySyncPort {
  private readonly logger = new Logger(KafkaReadingLegacySyncAdapter.name);

  constructor(
    @Inject(environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT)
    private readonly legacyReadingClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  syncCreateReadingLegacy(reading: CreateReadingLegacyRequest): void {
    try {
      this.kafkaProxy.emit(
        this.legacyReadingClient,
        'epaa-legacy.reading.create-reading-legacy',
        reading,
      );
    } catch (err) {
      this.logger.error(
        `Error syncing created reading to legacy: ${(err as Error).message}`,
      );
    }
  }

  syncUpdateReadingLegacy(
    params: FindCurrentReadingParams,
    request: UpdateReadingLegacyRequest,
  ): void {
    try {
      this.kafkaProxy.emit(
        this.legacyReadingClient,
        'epaa-legacy.reading.update-current-reading',
        { params, request },
      );
    } catch (err) {
      this.logger.error(
        `Error syncing updated reading to legacy: ${(err as Error).message}`,
      );
    }
  }
}
