import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuditContextStorage } from '../utils/audit-context.storage';

@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    // Extract User Identity if available (already set by AuthGuard)
    const user = request['user'];

    // Extract Technical Metadata (IP and User-Agent) ALWAYS
    const ip =
      request.headers['x-forwarded-for']?.toString() ||
      request.socket.remoteAddress ||
      '0.0.0.0';
    const userAgent = request.headers['user-agent']?.toString() || 'Unknown';

    // Se establece el contexto aun si no hay usuario (para auditar logins/fallos)
    return new Observable((observer) => {
      AuditContextStorage.run(
        {
          userId: user?.sub,
          userName: user?.username || 'Anonymous',
          ip,
          sessionId: user?.jti || request.cookies?.['auth_token']?.slice(0, 10),
          userAgent,
        },
        () => {
          next.handle().subscribe(observer);
        },
      );
    });
  }
}
