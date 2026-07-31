import { Injectable, Logger } from '@nestjs/common';
import { RealtimeService } from '../../../../../../shared/realtime';
import { IReadingRealtimeNotifierPort } from '../../application/ports/reading-realtime-notifier.port';

/**
 * RealtimeReadingNotifierAdapter — infrastructure adapter (DIP/OCP).
 * FIRE-AND-FORGET: a WebSocket broadcast failure must never fail the primary reading flow.
 */
@Injectable()
export class RealtimeReadingNotifierAdapter implements IReadingRealtimeNotifierPort {
  private readonly logger = new Logger(RealtimeReadingNotifierAdapter.name);

  constructor(private readonly realtimeService: RealtimeService) {}

  notifyReadingCreated(sectorId: number): void {
    try {
      // Mes actual del servidor (no el mes de la lectura, que puede ser el anterior)
      this.realtimeService.notifyReadingUpdated({
        sectorId,
        month: new Date().toISOString().slice(0, 7),
        type: 'created',
      });
    } catch (err) {
      this.logger.error(
        `Error broadcasting reading created event: ${(err as Error).message}`,
      );
    }
  }

  notifyReadingUpdated(sectorId: number, month: string): void {
    try {
      this.realtimeService.notifyReadingUpdated({
        sectorId,
        month,
        type: 'updated',
      });
    } catch (err) {
      this.logger.error(
        `Error broadcasting reading updated event: ${(err as Error).message}`,
      );
    }
  }
}
