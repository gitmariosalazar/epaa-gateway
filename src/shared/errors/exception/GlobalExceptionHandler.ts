import {
  Catch,
  RpcExceptionFilter,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { ApiResponse } from '../responses/ApiResponse';
import { statusCode } from 'src/settings/environments/status-code';

@Catch() // Captura todos los errores, no solo RpcException
export class RpcCustomExceptionFilter implements RpcExceptionFilter {
  private readonly logger = new Logger(RpcCustomExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToRpc();
    const response = ctx.getContext();
    const requestUrl = response.req?.url || 'unknown';

    let statusCodeValue = statusCode.INTERNAL_SERVER_ERROR; // 500 por defecto
    let message: string | string[] = ['An unknown error occurred'];

    // Manejar RpcException
    if (exception instanceof RpcException) {
      const errorResponse = exception.getError();
      this.logger.error(
        `RpcException caught: ${JSON.stringify(errorResponse)}`,
      );

      // Manejar AggregateError para errores de conexión (ECONNREFUSED)
      if (errorResponse instanceof AggregateError) {
        const errorDetails = errorResponse.errors || [];
        const connectionErrors = errorDetails.filter(
          (err: any) => err.code === 'ECONNREFUSED',
        );

        if (connectionErrors.length > 0) {
          this.logger.error('Connection refused error detected:');
          connectionErrors.forEach((err: any) => {
            this.logger.error(
              `Failed to connect to ${err.address}:${err.port}`,
            );
          });
          statusCodeValue = statusCode.SERVICE_UNAVAILABLE; // 503
          message = [
            'Connection refused by target service. Please check the service availability.',
          ];
        } else {
          statusCodeValue = statusCode.INTERNAL_SERVER_ERROR;
          message = errorDetails.map(
            (err: any) => err.message || 'Unknown error',
          );
        }
      } else if (typeof errorResponse === 'object' && errorResponse !== null) {
        // Manejar estructura { statusCode, message } o { error: { statusCode, message } }
        const errorObject = (errorResponse as any).error || errorResponse;
        const { statusCode: code, message: errorMessage } = errorObject as {
          statusCode?: number;
          message?: string | string[];
        };
        statusCodeValue = code || statusCode.INTERNAL_SERVER_ERROR;
        message = errorMessage || ['An unknown error occurred'];
      } else if (typeof errorResponse === 'string') {
        message = [errorResponse];
        statusCodeValue = statusCode.INTERNAL_SERVER_ERROR;
      }
    } else {
      // Manejar otros tipos de errores (no RpcException)
      this.logger.error(
        `Unexpected error caught: ${exception.message}`,
        exception.stack,
      );
      statusCodeValue = statusCode.INTERNAL_SERVER_ERROR;
      message = [exception.message || 'An unexpected error occurred'];
    }

    // Crear respuesta con ApiResponse
    const apiResponse = new ApiResponse(
      Array.isArray(message) ? message : [message],
      null,
      requestUrl,
    );
    apiResponse.status_code = statusCodeValue;

    // Estructura de respuesta final
    const responseBody = {
      time: new Date().toISOString(),
      message: Array.isArray(apiResponse.message)
        ? apiResponse.message
        : [apiResponse.message],
      url: apiResponse.url,
      data: apiResponse.data,
      status_code: apiResponse.status_code,
    };

    this.logger.error(`Error response sent: ${JSON.stringify(responseBody)}`);
    return response.status(statusCodeValue).json(responseBody);
  }
}
