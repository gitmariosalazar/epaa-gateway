/** Injection token for IReadingRealtimeNotifierPort implementations. */
export const READING_REALTIME_NOTIFIER_PORT = Symbol(
  'READING_REALTIME_NOTIFIER_PORT',
);

export interface ReadingUpdatedPayload {
  sectorId: number;
  month: string; // formato: 'YYYY-MM-DD' (ISO)
  type: 'created' | 'updated';
}

/**
 * Output port (DIP): pushes real-time reading events to connected WebSocket clients.
 * Fire-and-forget by contract — implementations must never throw back to the caller.
 */
export interface IReadingRealtimeNotifierPort {
  notifyReadingCreated(sectorId: number): void;
  notifyReadingUpdated(sectorId: number, month: string): void;
}
