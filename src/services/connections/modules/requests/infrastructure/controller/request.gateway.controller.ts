import {
  Body,
  Controller,
  Param,
  Get,
  Inject,
  Logger,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Delete,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
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
import { FilesInterceptor } from '@nestjs/platform-express';
import { NotificationValidationMatrixResponse } from '../../domain/schemas/dto/response/notification-validation-matrix.response';

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
  @ApiParam({ name: 'analistaId', type: String, required: true })
  @ApiOperation({
    summary: 'Expedientes de un analista',
    description:
      'Retorna todos los expedientes asociados a un analista específico.',
  })
  async getExpedientesByAnalista(
    @Param('analistaId') analistaId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.get_expedientes_by_analista',
          analistaId,
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
   * Los archivos se convierten a base64 y se envían por Kafka al microservicio.
   */
  @Post('submit-with-documents')
  @UseInterceptors(FilesInterceptor('files', 20)) // máximo 20 archivos
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
      const typeIds = (body.documentTypeIds ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Convierte cada archivo a base64 y lo empareja con su tipo de documento
      const documents = (files ?? []).map((file, idx) => ({
        documentTypeId: typeIds[idx] ?? typeIds[0] ?? '',
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeInBytes: file.size,
        fileBase64: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      }));

      const payload = {
        clientId: body.clientId,
        userId: body.userId, // UUID del usuario autenticado → fn_cambiar_estado_solicitud
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
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'requests.get_tracking_by_analista_id',
          analistaId,
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
