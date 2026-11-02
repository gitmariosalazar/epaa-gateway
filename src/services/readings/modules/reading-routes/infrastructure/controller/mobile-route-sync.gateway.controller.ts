import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { SyncMobileReadingsBatchRequestDto } from '../../domain/schemas/dto/request/route-gateway.request.dto';
import { LecturistDailyKpiResponseDto } from '../../domain/schemas/dto/response/route-gateway.response.dto';

@Controller(['mobile/reading-routes', 'api/v1/mobile/reading-routes'])
@ApiTags('Rutas - Sincronización Móvil Offline')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class MobileRouteSyncGatewayController {
  private readonly logger: Logger = new Logger(
    MobileRouteSyncGatewayController.name,
  );

  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  private extractUserId(request: Request): string {
    const user: any = (request as any)['user'];
    return user?.sub || user?.id || '00000000-0000-0000-0000-000000000001';
  }

  @Get('pack/:assignmentId')
  @ApiOperation({
    summary: 'Descargar paquete offline de trabajo para el dispositivo móvil',
    description:
      'Retorna la ruta completa asignada con sus acometidas en orden secuencial, lecturas anteriores e información cadastral.',
  })
  @ApiParam({ name: 'assignmentId', type: Number, description: 'ID de la asignación' })
  @SwaggerApiResponse({ status: 200, description: 'Paquete de trabajo descargado exitosamente' })
  async getPack(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.mobile.get-pack',
          { assignmentId },
        ),
      );
      return new ApiResponse(
        `Paquete de trabajo para asignación ${assignmentId} obtenido exitosamente`,
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en getPack (${assignmentId}): ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('sync-batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sincronizar lote de lecturas capturadas offline',
    description:
      'Carga masiva de lecturas con GPS, timestamp y novedades. Actualiza el avance de la ruta y emite eventos en Kafka.',
  })
  @SwaggerApiResponse({ status: 200, description: 'Lote de lecturas sincronizado exitosamente' })
  async syncBatch(
    @Body() dto: SyncMobileReadingsBatchRequestDto,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const usuarioId = this.extractUserId(request);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.mobile.sync-readings',
          {
            dto,
            usuarioId,
          },
        ),
      );
      return new ApiResponse(
        'Lote de lecturas sincronizado exitosamente',
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en syncBatch: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('my-daily-kpi')
  @ApiOperation({
    summary: 'Consultar rendimiento diario del lecturista autenticado',
    description:
      'Muestra el porcentaje de efectividad, predios leídos, pendientes y horas de primera/última captura.',
  })
  @ApiQuery({ name: 'fecha', required: false, type: String, description: 'Fecha YYYY-MM-DD (default: hoy)' })
  @SwaggerApiResponse({ status: 200, type: LecturistDailyKpiResponseDto })
  async getMyKpi(
    @Query('fecha') fecha: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const usuarioId = this.extractUserId(request);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.mobile.get-my-kpi',
          {
            usuarioId,
            fecha,
          },
        ),
      );
      return new ApiResponse(
        'Rendimiento diario obtenido exitosamente',
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en getMyKpi: ${error.message}`, error.stack);
      throw error;
    }
  }
}
