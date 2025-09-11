import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { statusCode } from 'src/settings/environments/status-code';

export async function sendKafkaRequest<T>(
  observable$,
  timeoutMs = 3000,
): Promise<T> {
  try {
    return await firstValueFrom(observable$.pipe(timeout(timeoutMs)));
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
