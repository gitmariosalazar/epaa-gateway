export const CONNECTION_REALTIME_NOTIFIER_PORT = Symbol(
  'CONNECTION_REALTIME_NOTIFIER_EVENT',
);
export interface ConnectionUpdatedOrUpdatedPayload {
  connectionId: string;
  sector: number;
  action: 'created' | 'updated';
}

export interface IConnectionRealtimeNotifierPort {
  notifyConnectionUpdated(payload: ConnectionUpdatedOrUpdatedPayload): void;
  notifyConnectionCreated(payload: ConnectionUpdatedOrUpdatedPayload): void;
}
