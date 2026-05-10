import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { environments } from '../../../../../../settings/environments/environments';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { LogSessionRequest } from '../../domain/schemas/dto/request/log-session.request';
import {
  GetAuditLogsRequest,
  GetSessionLogsRequest,
} from '../../domain/schemas/dto/request/get-audit-logs.request';

@Controller('audit-gateway')
@ApiTags('Audit-Gateway')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class AuditGatewayController {
  private readonly logger = new Logger(AuditGatewayController.name);

  constructor(
    @Inject('GATEWAY_AUDIT_KAFKA_CLIENT')
    private readonly clientKafka: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}



  @Post('log-session')
  @ApiOperation({
    summary: 'Registrar un evento de sesión (Login/Logout)',
    description:
      'Guarda un registro detallado de intentos de inicio o cierre de sesión.',
  })
  async logSession(
    @Body() requestData: LogSessionRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.clientKafka, 'audit.log-session', requestData),
      );

      return new ApiResponse(
        'Session event logged successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error logging session event: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-logs')
  @ApiOperation({
    summary: 'Obtener historial de mutaciones de base de datos',
    description:
      'Retorna los registros de auditoría de tablas (INSERT/UPDATE/DELETE).',
  })
  async getAuditLogs(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('tableName') tableName: string,
    @Query('operation') operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'TRUNCATE',
    @Query('userId') userId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      // Cast the strings back if needed, but Query decorators process them usually
      const payload: GetAuditLogsRequest = {
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        tableName,
        operation,
        userId,
      };

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.clientKafka, 'audit.get-logs', payload),
      );

      return new ApiResponse(
        'Audit logs retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving audit logs: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-session-logs')
  @ApiOperation({
    summary: 'Obtener historial de sesiones',
    description:
      'Retorna los registros de los eventos de inicio o falla de sesión de usuarios.',
  })
  async getSessionLogs(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('userId') userId: string,
    @Query('event') event: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED',
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const payload: GetSessionLogsRequest = {
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        event,
        userId,
      };

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.clientKafka, 'audit.get-session-logs', payload),
      );

      return new ApiResponse(
        'Session logs retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving session logs: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
