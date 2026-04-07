import { ClientKafka, KafkaHeaders } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { AuditContextStorage } from '../utils/audit-context.storage';

export class ContextualClientKafka extends ClientKafka {
  send<TResult = any, TInput = any>(pattern: any, data: TInput): Observable<TResult> {
    const context = AuditContextStorage.getContext();

    if (context) {
      const kafkaMessage = {
        value: data,
        headers: {
          'user-id': context.userId || '', // Permitir vacío para login/anónimos
          'user-name': context.userName || '',
          'user-ip': context.ip || '',
          'user-session-id': context.sessionId || '',
          'user-agent': context.userAgent || '',
        } as unknown as KafkaHeaders,
      };
      return super.send(pattern, kafkaMessage);
    }

    return super.send(pattern, data);
  }

  emit<TResult = any, TInput = any>(pattern: any, data: TInput): Observable<TResult> {
    const context = AuditContextStorage.getContext();

    if (context) {
      const kafkaMessage = {
        value: data,
        headers: {
          'user-id': context.userId || '',
          'user-name': context.userName || '',
          'user-ip': context.ip || '',
          'user-session-id': context.sessionId || '',
          'user-agent': context.userAgent || '',
        } as unknown as KafkaHeaders,
      };
      return super.emit(pattern, kafkaMessage);
    }

    return super.emit(pattern, data);
  }
}
