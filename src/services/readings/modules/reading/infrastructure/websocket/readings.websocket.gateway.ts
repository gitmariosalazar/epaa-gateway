// src/services/readings/modules/reading/infrastructure/websocket/readings.websocket.gateway.ts
//
// WebSocket Gateway para notificaciones en tiempo real de lecturas.
// Principios SOLID:
//   - SRP: solo gestiona conexiones WS y emisión de eventos; sin lógica de negocio.
//   - OCP: nuevos eventos se agregan sin modificar la clase.
//   - DIP: los controladores dependen de esta abstracción inyectada por NestJS DI.

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export const WS_EVENTS = {
  /** Emitido cuando se crea o actualiza una lectura */
  READING_UPDATED: 'reading:updated',
  /** Emitido cuando cambia el estado de auditoría de un sector */
  AUDIT_UPDATED: 'audit:updated',
} as const;

/**
 * Namespace /realtime — separado del namespace raíz para no interferir
 * con otras herramientas que puedan usar socket.io en el futuro.
 */
@WebSocketGateway({
  namespace: '/realtime',
  cors: {
    origin: '*', // En producción: restringir al dominio de la app móvil
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ReadingsWebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  /**
   * Instancia del servidor Socket.io inyectada por NestJS en tiempo de ejecución.
   * El operador `!` (definite assignment assertion) suprime TS2564 porque
   * el framework garantiza su asignación antes de cualquier evento del gateway.
   */
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ReadingsWebsocketGateway.name);

  afterInit() {
    this.logger.log('✅ WebSocket Gateway /realtime initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`❌ Client disconnected: ${client.id}`);
  }

  // ── Métodos de emisión (llamados por los controladores REST) ────────────────

  /**
   * Notifica a todos los clientes conectados que hubo una lectura nueva o
   * actualizada. El cliente Flutter reaccionará re-fetching el dashboard.
   *
   * @param payload - Datos mínimos para que el cliente sepa qué refrescar.
   */
  emitReadingUpdated(payload: {
    sectorId: number;
    month: string;
    type: 'created' | 'updated';
  }): void {
    this.logger.log(
      `📡 Emitting ${WS_EVENTS.READING_UPDATED} → sector ${payload.sectorId}`,
    );
    this.server.emit(WS_EVENTS.READING_UPDATED, payload);
  }

  /**
   * Notifica que el estado de auditoría de un sector cambió
   * (cierre supervisado, actualización de progreso, etc.).
   */
  emitAuditUpdated(payload: {
    sectorId: number;
    month: string;
    type: 'closed' | 'progress_changed';
  }): void {
    this.logger.log(
      `📡 Emitting ${WS_EVENTS.AUDIT_UPDATED} → sector ${payload.sectorId} / ${payload.month}`,
    );
    this.server.emit(WS_EVENTS.AUDIT_UPDATED, payload);
  }
}
