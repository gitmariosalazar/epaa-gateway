// src/realtime/realtime.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

// ── Orígenes CORS permitidos ──────────────────────────────────────────────────
// En producción: CORS_ORIGINS=https://sigepaa-aa.com,https://app.sigepaa-aa.com
// En desarrollo: dejar vacío o no definir → acepta cualquier origen (true)
//
// @WebSocketGateway tiene su propio CORS INDEPENDIENTE de app.enableCors().
// No heredan la misma configuración — deben definirse por separado.
function resolveWsCorsOrigin(): string[] | boolean {
  const raw = process.env.CORS_ORIGINS;
  if (!raw || raw.trim() === '') {
    // Sin variable → desarrollo local: acepta todo
    return true;
  }
  // Parsear lista separada por comas, eliminando espacios
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
}

@WebSocketGateway({
  namespace: '/realtime',
  cors: {
    origin: resolveWsCorsOrigin(),
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  /**
   * Inyectado por NestJS en runtime — el `!` suprime TS2564.
   * Disponible en afterInit(), handleConnection() y en RealtimeService.
   */
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    this.logger.log('✅ WebSocket /realtime inicializado y listo');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string;
      if (token) {
        const payload = this.jwtService.verify(token);
        client.data.user = payload;
        this.logger.log(
          `Client connected: ${client.id} (user: ${payload.sub})`,
        );
      } else {
        this.logger.log(
          `Client connected without authentication: ${client.id}`,
        );
      }
    } catch (err) {
      this.logger.warn(`Invalid token, disconnecting: ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
