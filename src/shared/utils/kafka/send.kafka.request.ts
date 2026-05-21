import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { statusCode } from '../../../settings/environments/status-code';

export async function sendKafkaRequest<T>(
  observable$,
  timeoutMs: number = 60000 * 5, // 5 minutos (ajusta según tu entorno)
): Promise<T> {
  try {
    // Validar que timeoutMs sea un número positivo válido
    const validTimeout = Math.max(
      1000,
      Number.isFinite(timeoutMs) ? Math.abs(timeoutMs) : 300000,
    );
    return await firstValueFrom(observable$.pipe(timeout(validTimeout)));
  } catch (error) {
    if (error instanceof TimeoutError) {
      throw new RpcException({
        statusCode: statusCode.SERVICE_UNAVAILABLE,
        message: 'Target microservice is not responding',
      });
    }

    throw error;
  }
}
