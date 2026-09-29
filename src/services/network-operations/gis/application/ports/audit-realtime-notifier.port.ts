/** Injection token for IAuditRealtimeNotifierPort implementations. */
export const AUDIT_REALTIME_NOTIFIER_PORT = Symbol(
  'AUDIT_REALTIME_NOTIFIER_PORT',
);

export interface AuditUpdatedPayload {
  sectorId: number;
  month: string;
  type: 'closed' | 'progress_changed';
}

/**
 * Output port (DIP): pushes real-time audit events to connected WebSocket clients.
 * Fire-and-forget by contract — implementations must never throw back to the caller.
 */
export interface IAuditRealtimeNotifierPort {
  notifyAuditUpdated(payload: AuditUpdatedPayload): void;
}
