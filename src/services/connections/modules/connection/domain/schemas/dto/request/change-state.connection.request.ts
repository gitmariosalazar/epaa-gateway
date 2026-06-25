export class ChangeConnectionStateRequest {
  connectionId!: string;
  newStateId!: number;
  userId!: string;
  motivo!: string;
  detallesTecnicos?: Record<string, any>;
}

export class BulkChangeConnectionStateRequest {
  connectionIds!: string[];
  newStateId!: number;
  userId!: string;
  motivo!: string;
}
