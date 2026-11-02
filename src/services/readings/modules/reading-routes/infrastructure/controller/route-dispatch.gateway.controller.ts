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
  Put,
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
import {
  AssignSingleRouteRequestDto,
  BatchMorningDispatchRequestDto,
  ReassignRouteSegmentRequestDto,
} from '../../domain/schemas/dto/request/route-gateway.request.dto';
import {
  BatchDispatchResponseDto,
  ReassignRouteSegmentResponseDto,
} from '../../domain/schemas/dto/response/route-gateway.response.dto';

@Controller(['route-assignments', 'api/v1/route-assignments'])
@ApiTags('Rutas - Despacho Operativo y Cuadrillas')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class RouteDispatchGatewayController {
  private readonly logger: Logger = new Logger(
    RouteDispatchGatewayController.name,
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

  @Post('bulk-dispatch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Despacho masivo matutino de rutas a cuadrillas de lecturistas',
    description:
      'Distribuye automáticamente las rutas pendientes del ciclo entre la lista de lecturistas disponibles llamando a pr_despacho_masivo_matutino.',
  })
  @SwaggerApiResponse({ status: 200, type: BatchDispatchResponseDto })
  async bulkDispatch(
    @Body() dto: BatchMorningDispatchRequestDto,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const supervisorId = this.extractUserId(request);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.dispatch.morning-batch',
          {
            dto,
            supervisorId,
          },
        ),
      );
      return new ApiResponse(
        'Despacho matutino ejecutado exitosamente',
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en bulkDispatch: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('single')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Asignar una ruta individual a un lecturista',
    description:
      'Genera una orden de asignación puntual de una ruta a un lecturista para el periodo especificado.',
  })
  @SwaggerApiResponse({ status: 201, description: 'Ruta asignada exitosamente' })
  async assignSingle(
    @Body() dto: AssignSingleRouteRequestDto,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const supervisorId = this.extractUserId(request);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.dispatch.single',
          {
            dto,
            supervisorId,
          },
        ),
      );
      return new ApiResponse(
        'Ruta asignada exitosamente',
        response,
        request.originalUrl || request.url,
        HttpStatus.CREATED,
      );
    } catch (error) {
      this.logger.error(`Error en assignSingle: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('reassign-segment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reasignación dinámica de segmento en campo (auxilio de cuadrilla)',
    description:
      'Transfiere en caliente las acometidas aún pendientes de una asignación en curso hacia otro lecturista (fn_reasignar_segmento_ruta).',
  })
  @SwaggerApiResponse({ status: 200, type: ReassignRouteSegmentResponseDto })
  async reassignSegment(
    @Body() dto: ReassignRouteSegmentRequestDto,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const supervisorId = this.extractUserId(request);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.dispatch.reassign-segment',
          {
            dto,
            supervisorId,
          },
        ),
      );
      return new ApiResponse(
        'Segmento pendiente reasignado exitosamente',
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en reassignSegment: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('live-tracking')
  @ApiOperation({
    summary: 'Monitoreo en vivo de avance de rutas en campo',
    description:
      'Supervisión en tiempo real del progreso operativo: predios leídos, novedades, pendientes y porcentaje de avance.',
  })
  @ApiQuery({ name: 'periodo', required: false, type: String, description: 'Periodo YYYY-MM' })
  @ApiQuery({ name: 'fecha', required: false, type: String, description: 'Fecha programada YYYY-MM-DD' })
  @SwaggerApiResponse({ status: 200, description: 'Listado de asignaciones con estado y métricas' })
  async liveTracking(
    @Query('periodo') periodo: string,
    @Query('fecha') fecha: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.dispatch.live-tracking',
          { periodo, fecha },
        ),
      );
      return new ApiResponse(
        'Monitoreo en vivo obtenido exitosamente',
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en liveTracking: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Put(':id/cancel')
  @ApiOperation({
    summary: 'Cancelar una asignación de ruta',
    description: 'Cancela una asignación pendiente o en curso.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la asignación' })
  @SwaggerApiResponse({ status: 200, description: 'Asignación cancelada exitosamente' })
  async cancelAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const supervisorId = this.extractUserId(request);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.dispatch.cancel',
          { idAsignacion: id, motivo, supervisorId },
        ),
      );
      return new ApiResponse(
        `Asignación ${id} procesada`,
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en cancelAssignment (${id}): ${error.message}`, error.stack);
      throw error;
    }
  }

  @Put(':id/resume')
  @ApiOperation({
    summary: 'Reanudar o reactivar una asignación de ruta pausada',
    description:
      'Reactiva una asignación en estado PAUSADA para el mismo lecturista, restaurando su estado a EN_PROCESO o ASIGNADA validando el límite de 3 rutas activas.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la asignación' })
  @SwaggerApiResponse({ status: 200, description: 'Asignación reactivada exitosamente' })
  async resumeAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const supervisorId = this.extractUserId(request);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.dispatch.resume',
          { idAsignacion: id, motivo, supervisorId },
        ),
      );
      return new ApiResponse(
        `Asignación ${id} reactivada exitosamente`,
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en resumeAssignment (${id}): ${error.message}`, error.stack);
      throw error;
    }
  }
}
