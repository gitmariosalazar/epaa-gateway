import {
  Body,
  Controller,
  Param,
  Get,
  HttpException,
  Inject,
  Logger,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Delete,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { CreateRequestRequest } from '../../domain/schemas/dto/request/create-request.request';
import { RequestResponse } from '../../domain/schemas/dto/response/request.response';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { UpdateRequestRequest } from '../../domain/schemas/dto/request/update-request.request';
import { SubmitWithDocumentsRequest } from '../../domain/schemas/dto/request/submit-with-documents.request';
import { SubmitCorrectionsRequest } from '../../domain/schemas/dto/request/submit-corrections.request';
import { AssignAnalystToRequestRequest } from '../../domain/schemas/dto/request/assign-analyst.request';
import { FilesInterceptor } from '@nestjs/platform-express';
import { NotificationValidationMatrixResponse } from '../../domain/schemas/dto/response/notification-validation-matrix.response';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { AllowedUserTypes } from '../../../../../../auth/decorator/allowed-user-types.decorator';
import { createHash, randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { basename, extname, join } from 'path';
import { AccessTokenPayload } from '../../../../../../shared/utils/interfaces/user.payload';

/** Rol que otorga visibilidad total sobre los expedientes, sin restricción por analista asignado. */
const SUPER_ADMIN_ROLE_NAME: string = 'SUPER ADMINISTRADOR';

/** Límite por archivo subido (se guarda directo a disco, no viaja por Kafka). */
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

@Controller('requests')
@ApiTags('requests')
export class RequestGatewayController {
  private readonly logger: Logger = new Logger(RequestGatewayController.name);

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {
    this.logger.log('RequestGatewayController initialized');
  }

  /**
   * Guarda el archivo directo en el disco compartido con `connection`
   * (CONNECTION_DOCUMENTS_UPLOAD_DIR) y retorna solo la referencia
   * (fileUrl + hash) para enviar por Kafka. Evita mandar el archivo
   * completo en base64 dentro del mensaje de Kafka.
   */
  private async saveDocumentToDisk(file: Express.Multer.File): Promise<{
    fileUrl: string;
    mimeType: string;
    sizeInBytes: number;
    hashSha256: string;
  }> {
    const uploadDir =
      environments.CONNECTION_DOCUMENTS_UPLOAD_DIR ||
      '/home/sigepaa/sigepaa/documents/connection-documents';
    const safeBaseName = basename(file.originalname || 'document').replace(
      /[^a-zA-Z0-9._-]/g,
      '_',
    );
    const extension = extname(safeBaseName);
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, fileName), file.buffer);

    return {
      fileUrl: `${environments.CONNECTION_DOCUMENTS_PUBLIC_PREFIX}/${fileName}`,
      mimeType: file.mimetype,
      sizeInBytes: file.size,
      hashSha256: createHash('sha256').update(file.buffer).digest('hex'),
    };
  }

  @Post('create_request')
  @ApiBody({ type: CreateRequestRequest })
  @ApiOperation({
    summary: 'Create a new connection request',
    description:
      'This endpoint allows you to create a new connection request by providing the necessary details in the request body.',
  })
  async createRequest(
    @Body() createRequest: CreateRequestRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: RequestResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.create_request',
          createRequest,
        ),
      );
      return new ApiResponse(
        `Request created successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('get_request_by_id')
  @ApiQuery({ name: 'requestId', type: String, required: true })
  @ApiOperation({
    summary: 'Get a connection request by ID',
    description:
      'This endpoint allows you to retrieve a specific connection request by providing its unique ID as a query parameter.',
  })
  async getRequestById(
    @Query('requestId') requestId: string,
  ): Promise<ApiResponse> {
    try {
      const response: RequestResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.get_request_by_id',
          requestId,
        ),
      );
      return new ApiResponse(
        `Request with ID ${requestId} found successfully!`,
        response,
        `/requests/get_request_by_id?requestId=${requestId}`,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('get_all_requests')
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 20 })
  @ApiQuery({ name: 'offset', type: Number, required: false, example: 0 })
  @ApiQuery({
    name: 'status',
    type: String,
    required: false,
    example: 'DOCS_SUBMITTED',
  })
  @ApiOperation({
    summary: 'Get all connection requests',
    description:
      'This endpoint allows you to retrieve a list of all connection requests, with optional pagination parameters (limit and offset) to control the number of results returned.',
  })
  async getAllRequests(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('status') status?: string,
  ): Promise<ApiResponse> {
    this.logger.log(
      `Getting all requests with limit: ${limit} and offset: ${offset}`,
    );
    try {
      const response: RequestResponse = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'requests.get_all_requests', {
          limit,
          offset,
          status,
        }),
      );
      return new ApiResponse(
        `All requests retrieved successfully!`,
        response,
        `/requests/get_all_requests?limit=${limit}&offset=${offset}${status ? `&status=${status}` : ''}`,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Put('update_request')
  @ApiBody({ type: UpdateRequestRequest })
  @ApiQuery({ name: 'requestId', type: String, required: true })
  @ApiOperation({
    summary: 'Update a connection request',
    description:
      'This endpoint allows you to update an existing connection request by providing its unique ID and the updated data in the request body.',
  })
  async updateRequest(
    @Query('requestId') requestId: string,
    @Body() updateData: UpdateRequestRequest,
  ): Promise<ApiResponse> {
    this.logger.log(
      `Updating request with ID: ${requestId} and data: ${JSON.stringify(updateData)}`,
    );
    try {
      const response: RequestResponse = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'requests.update_request', {
          requestId,
          updateData,
        }),
      );
      return new ApiResponse(
        `Request with ID ${requestId} updated successfully!`,
        response,
        `/requests/update_request?requestId=${requestId}`,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @ApiOperation({
    summary: 'Delete a connection request',
    description:
      'This endpoint allows you to delete an existing connection request by providing its unique ID as a query parameter.',
  })
  @Delete('delete_request')
  @ApiQuery({ name: 'requestId', type: String, required: true })
  async deleteRequest(
    @Query('requestId') requestId: string,
  ): Promise<ApiResponse> {
    this.logger.log(`Deleting request with ID: ${requestId}`);
    try {
      const response: RequestResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.delete_request',
          requestId,
        ),
      );
      return new ApiResponse(
        `Request with ID ${requestId} deleted successfully!`,
        response,
        `/requests/delete_request?requestId=${requestId}`,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  // ── Consultas enriquecidas para el frontend ────────────────────────────────

  @Get('dashboard/kpis')
  @ApiOperation({
    summary: 'Dashboard KPIs del módulo de acometidas',
    description:
      'Retorna métricas clave: total solicitudes, en proceso, completadas, rechazadas y promedio de días de tramitación.',
  })
  async getDashboardKpis(@Req() request: Request): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.get_dashboard_kpis',
          {},
        ),
      );
      return new ApiResponse(
        'Dashboard KPIs obtenidos exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get(':clienteId/dashboard/kpis')
  @ApiParam({ name: 'clienteId', type: String, required: true })
  @ApiOperation({
    summary: 'Dashboard KPIs del módulo de acometidas por cliente',
    description:
      'Retorna métricas clave: total solicitudes, en proceso, completadas, rechazadas y promedio de días de tramitación para un cliente específico.',
  })
  async getDashboardKpisByClienteId(
    @Param('clienteId') clienteId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.get_dashboard_kpis_by_cliente_id',
          clienteId,
        ),
      );
      return new ApiResponse(
        'Dashboard KPIs obtenidos exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('notifications/validation-matrix')
  @ApiOperation({
    summary: 'Matriz de validacion QA de notificaciones',
    description:
      'Retorna la matriz fase -> evento Kafka -> destinatario para validacion E2E en ambiente QA.',
  })
  @ApiOkResponse({ type: NotificationValidationMatrixResponse })
  async getNotificationValidationMatrix(
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: NotificationValidationMatrixResponse =
        await sendKafkaRequest(
          this.kafkaProxy.send(
            this.kafkaClient,
            'requests.get_notification_validation_matrix',
            {},
          ),
        );

      return new ApiResponse(
        'Matriz de validacion de notificaciones obtenida exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get(':solicitudId/expediente')
  @ApiParam({ name: 'solicitudId', type: String, required: true })
  @ApiOperation({
    summary: 'Expediente completo de una solicitud',
    description:
      'Retorna todos los datos de una solicitud: documentos, factura de inspección, informe técnico, contrato y registro catastral en un solo call. Ideal para la vista de detalle del frontend.',
  })
  async getExpediente(
    @Param('solicitudId') solicitudId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.get_expediente',
          solicitudId,
        ),
      );
      return new ApiResponse(
        'Expediente obtenido exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get(':clienteId/expedientes')
  @ApiParam({ name: 'clienteId', type: String, required: true })
  @ApiOperation({
    summary: 'Expedientes de un cliente',
    description:
      'Retorna todos los expedientes asociados a un cliente específico.',
  })
  async getExpedientesByCliente(
    @Param('clienteId') clienteId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.get_expedientes_by_cliente',
          clienteId,
        ),
      );
      return new ApiResponse(
        'Expedientes obtenidos exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get(':analistaId/expedientes-internal-user')
  @UseGuards(AuthGuard)
  @AllowedUserTypes('employee')
  @ApiBearerAuth()
  @ApiParam({ name: 'analistaId', type: String, required: true })
  @ApiOperation({
    summary: 'Expedientes de un analista',
    description:
      'Retorna todos los expedientes asociados a un analista específico. ' +
      `Si el usuario autenticado tiene el rol ${SUPER_ADMIN_ROLE_NAME}, retorna todos los expedientes sin filtrar por analista.`,
  })
  async getExpedientesByAnalista(
    @Param('analistaId') analistaId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const isSuperAdmin = this.isSuperAdmin(request);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.get_expedientes_by_analista',
          { analistaId, isSuperAdmin },
        ),
      );
      return new ApiResponse(
        'Expedientes obtenidos exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  /**
   * Determina si el usuario autenticado (payload del JWT validado por AuthGuard)
   * tiene el rol SUPER_ADMINISTRADOR. Nunca confiar en flags enviados por el cliente:
   * el rol siempre se deriva del token verificado en `request['user']`.
   */
  private isSuperAdmin(request: Request): boolean {
    const user: AccessTokenPayload = request['user'] as AccessTokenPayload;
    if (!user) {
      this.logger.warn(
        'No se encontró el payload del usuario en request["user"] al verificar rol SUPER_ADMINISTRADOR.',
      );
      return false;
    }
    const roles = user.roles || user['roles'] || [];
    this.logger.log(
      `Verificando roles del usuario autenticado: ${JSON.stringify(roles)}`,
    );
    return roles.some(
      (role) =>
        role === 'SUPER ADMINISTRADOR' || role === SUPER_ADMIN_ROLE_NAME,
    );
  }

  @Get(':solicitudId/historial')
  @ApiParam({ name: 'solicitudId', type: String, required: true })
  @ApiOperation({
    summary: 'Historial de cambios de estado de una solicitud',
    description:
      'Retorna el timeline ordenado cronológicamente de todas las transiciones de estado. Útil para el componente Stepper/Timeline del frontend.',
  })
  async getHistorial(
    @Param('solicitudId') solicitudId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.get_historial',
          solicitudId,
        ),
      );
      return new ApiResponse(
        'Historial obtenido exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get(':solicitudId/ordenes-trabajo')
  @ApiParam({ name: 'solicitudId', type: String, required: true })
  @ApiOperation({
    summary: 'Órdenes de trabajo vinculadas a una solicitud',
    description:
      'Retorna las OTs de inspección e instalación asociadas a la solicitud, con estado, prioridad y técnico asignado.',
  })
  async getOrdenesTrabajo(
    @Param('solicitudId') solicitudId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.get_ordenes_trabajo',
          solicitudId,
        ),
      );
      return new ApiResponse(
        'Órdenes de trabajo obtenidas exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  /**
   * Fase 2 — Enviar solicitud (DRAFT → DOCS_SUBMITTED)
   * El cliente confirma que adjuntó todos sus documentos y envía la solicitud formalmente.
   */
  @Patch(':solicitudId/submit')
  @ApiParam({ name: 'solicitudId', type: String, required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        clientId: { type: 'string', format: 'uuid' },
      },
      required: ['clientId'],
    },
  })
  @ApiOperation({
    summary: 'Fase 2: Enviar solicitud al analista',
    description:
      'Transiciona la solicitud de DRAFT → DOCS_SUBMITTED. Debe llamarse una vez que el cliente adjuntó todos sus documentos. A partir de este punto el analista puede validar la documentación.',
  })
  async submitRequest(
    @Param('solicitudId') solicitudId: string,
    @Body() body: { clientId: string },
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `[PATCH /requests/${solicitudId}/submit] clientId: ${body.clientId}`,
      );
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'requests.submit_request', {
          solicitudId,
          clientId: body.clientId,
        }),
      );
      return new ApiResponse(
        'Solicitud enviada exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  /**
   * OPERACIÓN ATÓMICA — Crear solicitud + documentos reales + DOCS_SUBMITTED en un solo call.
   * Acepta multipart/form-data con uno o más archivos reales.
   * Los archivos se guardan directo en disco (compartido con `connection`); por
   * Kafka solo viaja la referencia (fileUrl + hash), nunca el archivo completo.
   */
  @Post('submit-with-documents')
  @UseGuards(AuthGuard)
  @AllowedUserTypes('employee', 'customer')
  @ApiBearerAuth()
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  ) // máximo 20 archivos, 20MB c/u
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Fase única: Crear solicitud con documentos reales (atómico)',
    description:
      'Crea la solicitud, sube todos los archivos y transiciona a DOCS_SUBMITTED en una sola transacción. ' +
      'documentTypeIds debe ser una lista separada por comas con el mismo orden que los archivos. ' +
      'Si cualquier paso falla → ROLLBACK total en PostgreSQL.',
  })
  @ApiBody({ type: SubmitWithDocumentsRequest })
  async submitWithDocuments(
    @Body() body: SubmitWithDocumentsRequest,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `data: ${JSON.stringify(body)}, archivos recibidos: ${files?.length ?? 0}`,
      );
      // userId SIEMPRE del JWT verificado, nunca del body (evita spoofing)
      const user: AccessTokenPayload = request['user'] as AccessTokenPayload;
      const userId = user.sub;
      const typeIds = (body.documentTypeIds ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Guarda cada archivo directo a disco y arma solo la referencia (sin base64)
      const documents = await Promise.all(
        (files ?? []).map(async (file, idx) => {
          const stored = await this.saveDocumentToDisk(file);
          return {
            documentTypeId: typeIds[idx] ?? typeIds[0] ?? '',
            originalName: file.originalname,
            ...stored,
          };
        }),
      );

      const payload = {
        clientId: body.clientId,
        userId, // UUID del usuario autenticado (del JWT) → fn_cambiar_estado_solicitud
        personType: body.personType,
        connectionType: body.connectionType,
        propertyUse: body.propertyUse,
        address: body.address,
        cadastralKey: body.cadastralKey,
        longitude: body.longitude ? Number(body.longitude) : null,
        latitude: body.latitude ? Number(body.latitude) : null,
        additionalInfo: body.additionalInfo
          ? JSON.parse(body.additionalInfo as unknown as string)
          : {},
        documents,
      };

      this.logger.log(
        `[POST /requests/submit-with-documents] clientId: ${payload.clientId}, archivos: ${documents.length}`,
      );

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.submit_with_documents',
          payload,
        ),
      );
      return new ApiResponse(
        'Solicitud creada y enviada exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // conserva el status real (p.ej. 400 de la validación de tamaño)
      }
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  /**
   * OPERACIÓN ATÓMICA — Sube archivos corregidos para documentos rechazados
   * y transiciona la solicitud a DOCS_SUBMITTED. Los archivos se guardan
   * directo en disco; por Kafka solo viaja la referencia (fileUrl + hash).
   */
  @Post(':solicitudId/corrections')
  @UseGuards(AuthGuard)
  @AllowedUserTypes('employee', 'customer')
  @ApiBearerAuth()
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  ) // máximo 20 archivos, 20MB c/u
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Fase 2: Subir correcciones en lote (atómico)',
    description:
      'Sube todos los archivos corregidos y transiciona a DOCS_SUBMITTED en una sola transacción. ' +
      'documentIds debe ser una lista separada por comas con el mismo orden que los archivos. ' +
      'Si cualquier paso falla → ROLLBACK total en PostgreSQL.',
  })
  @ApiBody({ type: SubmitCorrectionsRequest })
  async submitCorrections(
    @Param('solicitudId') solicitudId: string,
    @Body() body: SubmitCorrectionsRequest,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `[POST /requests/${solicitudId}/corrections] data: ${JSON.stringify(body)}, archivos recibidos: ${files?.length ?? 0}`,
      );
      // userId SIEMPRE del JWT verificado, nunca del body (evita spoofing)
      const user: AccessTokenPayload = request['user'] as AccessTokenPayload;
      const userId = request['user']?.sub;
      const docIds = (body.documentIds ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Guarda cada archivo directo a disco y arma solo la referencia (sin base64)
      const documents = await Promise.all(
        (files ?? []).map(async (file, idx) => {
          const stored = await this.saveDocumentToDisk(file);
          return {
            documentId: docIds[idx] ?? docIds[0] ?? '',
            originalName: file.originalname,
            ...stored,
          };
        }),
      );

      const payload = {
        solicitudId,
        userId, // UUID del usuario autenticado (del JWT), nunca del body
        documents,
      };

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.submit_corrections',
          payload,
        ),
      );
      return new ApiResponse(
        'Correcciones subidas y enviadas exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // conserva el status real (p.ej. 400 de la validación de tamaño)
      }
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  /**
   * Asignación MANUAL de analista, elegida desde el frontend. Solo tiene
   * efecto si la solicitud aún no tiene analista asignado; no reemplaza la
   * autoasignación/round-robin que ya ocurre al crear la solicitud.
   */
  @Put(':solicitudId/assign-analyst')
  @UseGuards(AuthGuard)
  @AllowedUserTypes('employee')
  @ApiBearerAuth()
  @ApiParam({ name: 'solicitudId', type: String, required: true })
  @ApiBody({ type: AssignAnalystToRequestRequest })
  @ApiOperation({
    summary: 'Asignar manualmente un analista a una solicitud',
    description:
      'Solo aplica si la solicitud aún no tiene analista asignado (p.ej. quedó sin asignar por falta de analistas activos al crearla).',
  })
  async assignAnalyst(
    @Param('solicitudId') solicitudId: string,
    @Body() body: AssignAnalystToRequestRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'requests.assign_analyst', {
          solicitudId,
          analystId: body.analystId,
        }),
      );
      return new ApiResponse(
        'Analista asignado exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  // ── Tracking en tiempo real ────────────────────────────────────────────────

  /**
   * Retorna todas las solicitudes de un cliente enriquecidas con:
   * - Fase actual del BPMN (currentStep, stepIndex 0-6)
   * - Estado legible (estadoActualLabel)
   * - Fecha formateada en español (fechaCreacion)
   * - Métricas (diasEnProceso, documentos, pago, inspección, contrato, instalación)
   * - Timeline completo (historial)
   *
   * Diseñado para alimentar directamente el wizard de seguimiento del frontend.
   */
  @Get(':clienteId/tracking')
  @ApiParam({
    name: 'clienteId',
    type: String,
    description:
      'Cédula (10 dígitos) o RUC (13 dígitos) del cliente, o UUID del cliente_usuario',
    example: '1234567890',
  })
  @ApiOperation({
    summary: 'Tracking en tiempo real de solicitudes de un cliente',
    description:
      'Retorna el listado de todas las solicitudes del cliente enriquecidas con la fase actual del BPMN ' +
      '(currentStep: solicitud | documentos | pago | inspeccion | contrato | instalacion | catastro | completado | anulada | rechazada), ' +
      'stepIndex (0-6 para barra de progreso, -1 para estados terminales negativos), ' +
      'métricas de tiempo, conteos de documentos, datos de pago, inspección, contrato, instalación y el ' +
      'timeline completo de cambios de estado ordenado cronológicamente.',
  })
  async getTracking(
    @Param('clienteId') clienteId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`[GET /requests/${clienteId}/tracking]`);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.get_tracking',
          clienteId,
        ),
      );
      return new ApiResponse(
        'Tracking de solicitudes obtenido exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get(':analistaId/tracking-internal-user')
  @UseGuards(AuthGuard)
  @AllowedUserTypes('employee')
  @ApiBearerAuth()
  @ApiParam({
    name: 'analistaId',
    type: String,
    description: 'UUID del analista (usuario interno)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOperation({
    summary: 'Tracking en tiempo real de solicitudes asignadas a un analista',
    description:
      'Retorna el listado de todas las solicitudes asignadas a un analista específico, enriquecidas con la fase actual del BPMN, estado legible, métricas y timeline completo.',
  })
  async getTrackingByAnalista(
    @Param('analistaId') analistaId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`[GET /requests/${analistaId}/tracking-internal-user]`);
      const isSuperAdmin = this.isSuperAdmin(request);

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.get_tracking_by_analista_id',
          { analistaId, isSuperAdmin },
        ),
      );
      return new ApiResponse(
        'Tracking de solicitudes para analista obtenido exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get(':solicitudId/tracking-by-solicitud-id')
  @ApiParam({
    name: 'solicitudId',
    type: String,
    description: 'UUID de la solicitud',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOperation({
    summary: 'Tracking detallado de una solicitud por ID',
    description:
      'Retorna el tracking detallado de una solicitud específica identificada por su UUID, enriquecida con la fase actual del BPMN, estado legible, métricas y timeline completo.',
  })
  async getTrackingBySolicitud(
    @Param('solicitudId') solicitudId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `[GET /requests/${solicitudId}/tracking-by-solicitud-id]`,
      );
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.get_tracking_by_solicitud_id',
          solicitudId,
        ),
      );
      return new ApiResponse(
        'Tracking de solicitud obtenido exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get(':requestNumberOrId/detail-by-id-or-number')
  @ApiParam({
    name: 'requestNumberOrId',
    type: String,
    description:
      'Número de solicitud (ej: SOL-2023-0001) o UUID de la solicitud (ej: 550e8400-e29b-41d4-a716-446655440000)',
    example: 'SOL-2023-0001',
  })
  @ApiOperation({
    summary: 'Detalle de solicitud por número o ID para cliente',
    description:
      'Retorna el detalle completo de una solicitud identificada por su número o UUID, incluyendo información general, estado actual, documentos asociados, datos de pago, inspección, contrato e instalación. Diseñado para la vista de detalle del cliente en el frontend.',
  })
  async getRequestDetailByRequestIdOrNumber(
    @Param('requestNumberOrId') requestNumberOrId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `[GET /requests/${requestNumberOrId}/detail-by-id-or-number]`,
      );
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.get_request_detail_by_request_id_or_number',
          requestNumberOrId,
        ),
      );
      return new ApiResponse(
        'Detalle de solicitud obtenido exitosamente',
        response,
        request.url,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }
}
