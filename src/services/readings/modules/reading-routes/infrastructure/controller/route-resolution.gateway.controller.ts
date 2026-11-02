import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
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
  InsertConnectionIntoRouteRequestDto,
  OptimizeRouteSequenceRequestDto,
  ResolveRouteRequestDto,
} from '../../domain/schemas/dto/request/route-gateway.request.dto';
import {
  OptimizeRouteSequenceResponseDto,
  ResolvedRouteResponseDto,
} from '../../domain/schemas/dto/response/route-gateway.response.dto';

@Controller(['reading-routes', 'api/v1/reading-routes'])
@ApiTags('Rutas - Enrutamiento Inteligente y Secuencia')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class RouteResolutionGatewayController {
  private readonly logger: Logger = new Logger(
    RouteResolutionGatewayController.name,
  );

  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Post('resolve-route')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resolver a qué ruta pertenece una acometida por coordenadas (Point-in-Polygon / KNN / Fallback)',
    description:
      'Determina la ruta óptima mediante análisis espacial PostGIS en cascada: 1) ST_Within, 2) KNN centroide más cercano, 3) Fallback balanceado de sector.',
  })
  @SwaggerApiResponse({ status: 200, type: ResolvedRouteResponseDto })
  async resolveRoute(
    @Body() dto: ResolveRouteRequestDto,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.resolve-connection',
          dto,
        ),
      );
      return new ApiResponse(
        'Ruta resuelta exitosamente para la acometida',
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en resolveRoute: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('insert-connection')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Insertar una nueva acometida en la secuencia de una ruta existente',
    description:
      'Registra la relación ruta-acometida en public.ruta_acometida e inserta en la posición indicada desplazando las subsecuentes (fn_insertar_acometida_en_secuencia).',
  })
  @SwaggerApiResponse({ status: 200, description: 'Acometida insertada exitosamente en la secuencia' })
  async insertConnection(
    @Body() dto: InsertConnectionIntoRouteRequestDto,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.insert-connection',
          dto,
        ),
      );
      return new ApiResponse(
        'Acometida insertada exitosamente en la secuencia',
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en insertConnection: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post(':id/optimize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reoptimizar el orden de recorrido de una ruta (Algoritmo TSP de menor camino)',
    description:
      'Ejecuta fn_aplicar_secuencia_optima_ruta para calcular la ruta más corta minimizando la distancia de caminata del lecturista.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la ruta a reordenar' })
  @SwaggerApiResponse({ status: 200, type: OptimizeRouteSequenceResponseDto })
  async optimizeSequence(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: OptimizeRouteSequenceRequestDto,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.optimize-sequence',
          { idRuta: id, acometidaInicio: dto?.acometidaInicio },
        ),
      );
      return new ApiResponse(
        `Secuencia de la ruta ${id} optimizada exitosamente`,
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en optimizeSequence (${id}): ${error.message}`, error.stack);
      throw error;
    }
  }
}
