import { Injectable, Logger } from '@nestjs/common';
import { RealtimeService } from '../../../../../../shared/realtime';
import {
  IConnectionRealtimeNotifierPort,
  ConnectionUpdatedOrUpdatedPayload,
} from '../../application/ports/connection-realtime-notifier.port';
import { ConnectionRealtimeEvents } from '../../application/interfaces/connection.events.enum';
/**
 * RealtimeConnectionNotifierAdapter — infrastructure adapter (DIP/OCP).
 * FIRE-AND-FORGET: a WebSocket broadcast failure must never fail the primary connection flow.
 */
@Injectable()
export class RealtimeConnectionNotifierAdapter implements IConnectionRealtimeNotifierPort {
  // Implementing IConnectionRealtimeNotifierPort requires notifyConnectionCreated and notifyConnectionUpdated methods
  private readonly logger = new Logger(RealtimeConnectionNotifierAdapter.name);

  constructor(private readonly realtimeService: RealtimeService) {}

  notifyConnectionCreated(payload: ConnectionUpdatedOrUpdatedPayload): void {
    const { connectionId, sector } = payload;
    try {
      // Mes actual del servidor (no el mes de la lectura, que puede ser el anterior)
      this.realtimeService.notify<ConnectionUpdatedOrUpdatedPayload>(
        ConnectionRealtimeEvents.CONNECTION_CREATED,
        {
          connectionId,
          sector,
          action: 'created',
        },
      );
    } catch (err) {
      this.logger.error(
        `Error broadcasting connection created event: ${(err as Error).message}`,
      );
    }
  }

  notifyConnectionUpdated(payload: ConnectionUpdatedOrUpdatedPayload): void {
    const { connectionId, sector } = payload;
    try {
      this.realtimeService.notify<ConnectionUpdatedOrUpdatedPayload>(
        ConnectionRealtimeEvents.CONNECTION_UPDATED,
        {
          connectionId,
          sector,
          action: 'updated',
        },
      );
    } catch (err) {
      this.logger.error(
        `Error broadcasting connection updated event: ${(err as Error).message}`,
      );
    }
  }
}
