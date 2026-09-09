import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { IRealtimeNotifier } from '../application/interfaces/realtime-notifier.interface';

@Injectable()
export class RealtimeService implements IRealtimeNotifier {
  constructor(private readonly gateway: RealtimeGateway) {}

  notify<T>(event: string, payload: T): void {
    this.gateway.server.emit(event, payload);
  }
}
