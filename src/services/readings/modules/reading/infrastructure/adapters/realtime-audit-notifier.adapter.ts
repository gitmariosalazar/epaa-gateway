import { Injectable, Logger } from '@nestjs/common';
import { RealtimeService } from '../../../../../../shared/realtime';
import {
  IAuditRealtimeNotifierPort,
  AuditUpdatedPayload,
} from '../../application/ports/audit-realtime-notifier.port';
import { ReadingRealtimeEvents } from '../../application/interfaces/reading-events.enum';

/**
 * RealtimeAuditNotifierAdapter — infrastructure adapter (DIP/OCP).
 * FIRE-AND-FORGET: a WebSocket broadcast failure must never fail the primary flow.
 */
@Injectable()
export class RealtimeAuditNotifierAdapter implements IAuditRealtimeNotifierPort {
  private readonly logger = new Logger(RealtimeAuditNotifierAdapter.name);

  constructor(private readonly realtimeService: RealtimeService) {}

  notifyAuditUpdated(payload: AuditUpdatedPayload): void {
    try {
      this.realtimeService.notify<AuditUpdatedPayload>(
        ReadingRealtimeEvents.AUDIT_UPDATED,
        payload,
      );
    } catch (err) {
      this.logger.error(
        `Error broadcasting audit updated event: ${(err as Error).message}`,
      );
    }
  }
}
