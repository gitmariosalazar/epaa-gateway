import { CreateReadingLegacyRequest } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/create.reading-legacy.request';
import { UpdateReadingLegacyRequest } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/update.reading.request';
import { FindCurrentReadingParams } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/find-current-reading-params';

/** Injection token for IReadingLegacySyncPort implementations. */
export const READING_LEGACY_SYNC_PORT = Symbol('READING_LEGACY_SYNC_PORT');

/**
 * Output port (DIP): synchronizes reading data with the legacy SIGAME system.
 * Fire-and-forget by contract — implementations must never throw back to the caller.
 */
export interface IReadingLegacySyncPort {
  syncCreateReadingLegacy(reading: CreateReadingLegacyRequest): void;
  syncUpdateReadingLegacy(
    params: FindCurrentReadingParams,
    request: UpdateReadingLegacyRequest,
  ): void;
}
