import {
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
  HttpStatus,
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
import { FindReadingRoutesQueryDto } from '../../domain/schemas/dto/request/route-gateway.request.dto';

@Controller(['reading-routes', 'api/v1/reading-routes'])
@ApiTags('Rutas - Catálogo Maestro y Capas GIS')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ReadingRouteCatalogGatewayController {
  private readonly logger: Logger = new Logger(
    ReadingRouteCatalogGatewayController.name,
  );

  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Consultar catálogo de rutas de lectura con filtros y paginación',
    description:
      'Retorna el listado paginado de rutas activas o filtradas por sector con cantidad de predios y tiempo estimado.',
  })
  @SwaggerApiResponse({ status: 200, description: 'Catálogo de rutas obtenido exitosamente' })
  async findAll(
    @Query() query: FindReadingRoutesQueryDto,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.find-all',
          query,
        ),
      );
      return new ApiResponse(
        'Catálogo de rutas obtenido exitosamente',
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en findAll reading-routes: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('geojson')
  @ApiOperation({
    summary: 'Obtener capa GeoJSON de polígonos de rutas',
    description:
      'Retorna una FeatureCollection de polígonos GeoJSON de las rutas para visualización en visores cartográficos web.',
  })
  @ApiQuery({ name: 'sectorId', required: false, type: Number, description: 'Filtrar por sector comercial' })
  @ApiQuery({ name: 'activa', required: false, type: Boolean, description: 'Filtrar por rutas activas (default: true)' })
  @SwaggerApiResponse({ status: 200, description: 'GeoJSON de rutas obtenido exitosamente' })
  async getGeoJson(
    @Query('sectorId') sectorId: number,
    @Query('activa') activa: boolean,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.get-geojson',
          {
            sectorId: sectorId ? Number(sectorId) : undefined,
            activa: activa !== undefined ? String(activa) === 'true' : undefined,
          },
        ),
      );
      return new ApiResponse(
        'Capa GeoJSON de rutas obtenida exitosamente',
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en getGeoJson reading-routes: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('centroids')
  @ApiOperation({
    summary: 'Obtener GeoJSON de centroides de las rutas',
    description:
      'Retorna una FeatureCollection ligera de los 79 centroides calculados para pines o marcadores analíticos.',
  })
  @ApiQuery({ name: 'activaOnly', required: false, type: Boolean, description: 'Filtrar solo rutas activas' })
  @SwaggerApiResponse({ status: 200, description: 'GeoJSON de centroides obtenido exitosamente' })
  async getCentroids(
    @Query('activaOnly') activaOnly: boolean,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.get-centroids',
          { activaOnly: activaOnly !== undefined ? String(activaOnly) === 'true' : true },
        ),
      );
      return new ApiResponse(
        'Centroides de rutas obtenidos exitosamente',
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en getCentroids reading-routes: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de una ruta por ID',
    description: 'Retorna la información completa de una ruta específica incluyendo polígono WKT/GeoJSON.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la ruta' })
  @SwaggerApiResponse({ status: 200, description: 'Detalle de la ruta obtenido exitosamente' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.get-by-id',
          { id },
        ),
      );
      return new ApiResponse(
        `Detalle de la ruta ${id} obtenido exitosamente`,
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en getById reading-routes (${id}): ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id/connections')
  @ApiOperation({
    summary: 'Obtener listado de acometidas en secuencia física de la ruta',
    description:
      'Retorna el listado ordenado de las acometidas asociadas a la ruta para auditoría o visualización de secuencia.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la ruta' })
  @SwaggerApiResponse({ status: 200, description: 'Acometidas de la ruta obtenidas exitosamente' })
  async getConnections(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading-routes.get-connections',
          { id },
        ),
      );
      return new ApiResponse(
        `Acometidas de la ruta ${id} obtenidas exitosamente`,
        response,
        request.originalUrl || request.url,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Error en getConnections reading-routes (${id}): ${error.message}`, error.stack);
      throw error;
    }
  }
}
