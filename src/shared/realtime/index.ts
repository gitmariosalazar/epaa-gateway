// src/shared/realtime/index.ts
// Barrel — punto de entrada único para el módulo compartido de tiempo real.
export { RealtimeModule } from './realtime.module';
export { RealtimeService } from './realtime.service';
export type {
  ReadingUpdatedPayload,
  AuditUpdatedPayload,
} from './realtime.service';
// RealtimeGateway NO se exporta: es un detalle de infraestructura interno.
