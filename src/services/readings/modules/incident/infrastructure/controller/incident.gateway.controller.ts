import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { renameSync } from 'fs';
import { CreateIncidentRequest } from '../../domain/schemas/dto/request/create-incident.request';
import { ResolveIncidentRequest } from '../../domain/schemas/dto/request/resolve-incident.request';
import { SearchIncidentsRequest } from '../../domain/schemas/dto/request/search-incidents.request';
import { IncidentResponse } from '../../domain/schemas/dto/response/incident.response';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { AllowedUserTypes } from '../../../../../../auth/decorator/allowed-user-types.decorator';
import { IncidentCategoryResponse } from '../../domain/schemas/dto/response/incident-category-type.response';

const INCIDENT_IMAGES_DIR = '/home/sigepaa/sigepaa/images/incidents';

const incidentImagesInterceptor = FilesInterceptor('images', 10, {
  storage: diskStorage({
    destination: INCIDENT_IMAGES_DIR,
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `temp-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Solo se permiten archivos de imagen'), false);
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

@Controller('incidents')
@ApiTags('Incidents')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class IncidentGatewayController {
  private readonly logger: Logger = new Logger(IncidentGatewayController.name);

  constructor(
    @Inject(environments.INCIDENT_KAFKA_CLIENT)
    private readonly incidentClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Post('create-incident')
  @AllowedUserTypes('employee', 'customer')
  @UseInterceptors(incidentImagesInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Method POST - Create a new Incident',
    description:
      'Reporta un incidente. Adjunta imágenes en el campo "images" (opcional, máx. 10).',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['incidentTypeId', 'reportDescription', 'reportOrigin'],
      properties: {
        connectionId: { type: 'string', example: '14-293' },
        readingId: { type: 'number', example: 123 },
        incidentTypeId: { type: 'number', example: 1 },
        reportDescription: {
          type: 'string',
          example: 'Tubería rota con fuga de agua.',
        },
        referenceAddress: {
          type: 'string',
          example: 'Av. Principal #123',
        },
        reportOrigin: {
          type: 'string',
          enum: [
            'LECTURISTA',
            'ATENCION_AL_CLIENTE',
            'INSPECTOR',
            'WEB_USUARIO',
          ],
        },
        priority: {
          type: 'string',
          enum: ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'],
        },
        latitude: { type: 'number', example: -0.1807 },
        longitude: { type: 'number', example: -78.4678 },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Fotos del incidente (opcional, máx. 10)',
        },
      },
    },
  })
  async createIncident(
    @Body() body: Record<string, string>,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const userPayload = (request as any)['user'];
      const userId = userPayload?.sub ?? userPayload?.userId;
      const userType = userPayload?.user_type || 'employee';

      const incidentRequest = this.parseCreateIncidentBody(body);
      const imageUrls = this.saveUploadedImages(
        files ?? [],
        incidentRequest.connectionId ?? 'incident',
      );

      const kafkaPayload: CreateIncidentRequest & {
        reporterUserId?: string;
        clienteUsuarioReportaId?: string;
      } = {
        ...incidentRequest,
        images: imageUrls,
      };

      if (userType === 'customer') {
        kafkaPayload.clienteUsuarioReportaId = userId;
      } else {
        kafkaPayload.reporterUserId = userId;
      }

      const response: IncidentResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.incidentClient,
          'incident.create-incident',
          kafkaPayload,
        ),
      );

      return new ApiResponse(
        'Incident reported successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error reporting incident: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Put('resolve-incident/:incidentId')
  @UseInterceptors(incidentImagesInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Method PUT - Resolve an Incident by ID',
    description:
      'Marca un incidente como resuelto. Adjunta fotos de la reparación en "images" (opcional).',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['description', 'repairCost', 'chargeToUser'],
      properties: {
        description: {
          type: 'string',
          example: 'Se reemplazó la tubería dañada.',
        },
        repairCost: { type: 'number', example: 150.5 },
        chargeToUser: { type: 'boolean', example: true },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Fotos de la resolución (opcional, máx. 10)',
        },
      },
    },
  })
  async resolveIncident(
    @Param('incidentId', ParseIntPipe) incidentId: number,
    @Body() body: Record<string, string>,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const resolverUserId =
        (request as any)['user']?.sub ?? (request as any)['user']?.userId;

      const incidentRequest = this.parseResolveIncidentBody(body);
      const imageUrls = this.saveUploadedImages(
        files ?? [],
        `resolve-${incidentId}`,
      );

      const response: IncidentResponse = await sendKafkaRequest(
        this.kafkaProxy.send(this.incidentClient, 'incident.resolve-incident', {
          incidentId,
          request: {
            ...incidentRequest,
            images: imageUrls,
          },
          resolverUserId,
        }),
      );

      return new ApiResponse(
        `Incident with ID ${incidentId} resolved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error resolving incident ${incidentId}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('find-by-connection/:connectionId')
  @ApiOperation({
    summary: 'Method GET - Find Incidents by Connection ID',
    description:
      'The endpoint allows you to search reported incidents linked to a connection ID',
  })
  async findIncidentsByConnection(
    @Param('connectionId') connectionId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: IncidentResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.incidentClient,
          'incident.find-by-connection',
          connectionId,
        ),
      );

      return new ApiResponse(
        `Incidents for connection ID ${connectionId} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error finding incidents by connection ID ${connectionId}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('search')
  @AllowedUserTypes('employee', 'customer')
  @ApiOperation({
    summary: 'Method GET - Search Incidents with dynamic filters',
    description:
      'The endpoint allows you to search and list incidents with filters like connectionId, status, priority, and type',
  })
  async searchIncidents(
    @Query() filters: SearchIncidentsRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: IncidentResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(this.incidentClient, 'incident.search', filters),
      );

      return new ApiResponse(
        'Incidents searched successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error searching incidents: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Method GET - Retrieve Incident Categories and Types',
    description:
      'The endpoint allows you to retrieve all incident categories along with their associated types',
  })
  async findIncidentCategories(@Req() request: Request): Promise<ApiResponse> {
    try {
      const response: IncidentCategoryResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(this.incidentClient, 'incident.categories', {}),
      );

      return new ApiResponse(
        'Incident categories retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving incident categories: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  private parseCreateIncidentBody(
    body: Record<string, string>,
  ): CreateIncidentRequest {
    if (!body.incidentTypeId || !body.reportDescription || !body.reportOrigin) {
      throw new BadRequestException(
        'incidentTypeId, reportDescription y reportOrigin son obligatorios',
      );
    }

    return {
      connectionId: body.connectionId?.trim() || null,
      readingId: this.parseOptionalNumber(body.readingId),
      incidentTypeId: Number(body.incidentTypeId),
      reportDescription: body.reportDescription,
      referenceAddress: body.referenceAddress?.trim() || null,
      reportOrigin: body.reportOrigin as CreateIncidentRequest['reportOrigin'],
      priority: body.priority as CreateIncidentRequest['priority'],
      latitude: this.parseOptionalNumber(body.latitude),
      longitude: this.parseOptionalNumber(body.longitude),
    };
  }

  private parseResolveIncidentBody(
    body: Record<string, string>,
  ): ResolveIncidentRequest {
    if (
      body.description === undefined ||
      body.repairCost === undefined ||
      body.chargeToUser === undefined
    ) {
      throw new BadRequestException(
        'description, repairCost y chargeToUser son obligatorios',
      );
    }

    return {
      description: body.description,
      repairCost: Number(body.repairCost),
      chargeToUser: this.parseBoolean(body.chargeToUser),
    };
  }

  private parseOptionalNumber(value?: string | number): number | null {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    if (value.trim() === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private parseBoolean(value: string): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    return String(value).toLowerCase() === 'true';
  }

  private saveUploadedImages(
    files: Express.Multer.File[],
    prefix: string,
  ): string[] {
    return files.map((image) => {
      const tempPath = image.path;
      const finalFilename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(image.filename)}`;
      const finalPath = join(INCIDENT_IMAGES_DIR, finalFilename);
      renameSync(tempPath, finalPath);

      const imageUrl = `$/images/incidents/${finalFilename}`;
      this.logger.log(`Incident image uploaded: ${imageUrl}`);
      return imageUrl;
    });
  }
}
