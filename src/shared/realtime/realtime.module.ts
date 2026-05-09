// src/shared/realtime/realtime.module.ts
//
// Módulo GLOBAL que registra el WebSocket Gateway compartido.
// Al ser global, basta con importarlo UNA SOLA VEZ en AppModule.
// Cualquier otro módulo puede inyectar RealtimeService directamente
// sin necesidad de re-importar este módulo (DIP + OCP).

import { Global, Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';

@Global()
@Module({
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
