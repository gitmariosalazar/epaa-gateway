// src/realtime/realtime.service.ts
import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

export interface ReadingUpdatedPayload {
  sectorId: number;
  month: string; // formato: 'YYYY-MM-DD' (ISO)
  type: 'created' | 'updated';
}

export interface AuditUpdatedPayload {
  sectorId: number;
  month: string;
  type: 'closed' | 'progress_changed';
}

@Injectable()
export class RealtimeService {
  constructor(private readonly gateway: RealtimeGateway) {}

  notifyReadingUpdated(payload: ReadingUpdatedPayload): void {
    this.gateway.server.emit('reading:updated', payload);
  }

  notifyAuditUpdated(payload: AuditUpdatedPayload): void {
    this.gateway.server.emit('audit:updated', payload);
  }
}
