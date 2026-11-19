import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { createHash, randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { basename, extname, join } from 'path';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { AllowedUserTypes } from '../../../../../../auth/decorator/allowed-user-types.decorator';
import { AccessTokenPayload } from '../../../../../../shared/utils/interfaces/user.payload';

import { ChangeConnectionStateGatewayRequest } from '../../domain/dto/request/change-connection-state.gateway.request';
import { BulkChangeConnectionStateGatewayRequest } from '../../domain/dto/request/bulk-change-connection-state.gateway.request';
import { RevertStateHistoryGatewayRequest } from '../../domain/dto/request/revert-state-history.gateway.request';
import { FilterStateHistoryGatewayRequest } from '../../domain/dto/request/filter-state-history.gateway.request';

import {
  StateHistoryGatewayResponse,
  BulkStateChangeGatewayResponse,
} from '../../domain/dto/response/state-history.gateway.response';
import { StateCatalogGatewayResponse } from '../../domain/dto/response/state-catalog.gateway.response';
import { StateSummaryGatewayResponse } from '../../domain/dto/response/state-summary.gateway.response';
import { CurrentConnectionStateGatewayResponse } from '../../domain/dto/response/current-connection-state.gateway.response';
import { AllowedTransitionsGatewayResponse } from '../../domain/dto/response/allowed-transitions.gateway.response';
import { ReversibleRecordGatewayResponse } from '../../domain/dto/response/reversible-record.gateway.response';
import { StateEventsGeoJSONGatewayResponse } from '../../domain/dto/response/geo-events.gateway.response';

@ApiTags('state-history')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@AllowedUserTypes('employee')
@Controller('state-history')
export class StateHistoryGatewayController {
  private readonly logger: Logger = new Logger(
    StateHistoryGatewayController.name,
  );

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {
    this.logger.log('StateHistoryGatewayController initialized');
  }

  private extractUserId(request: Request, fallbackUserId?: string): string {
    const rawUser = (
      request as unknown as {
        user?: AccessTokenPayload | Record<string, unknown>;
      }
    )?.user;
    const tokenUserId = (
      rawUser?.['sub'] ??
      rawUser?.['userId'] ??
      rawUser?.['usuario_id'] ??
      rawUser?.['id'] ??
      rawUser?.['cliente_id']
    ) as string | undefined;

    const resolved = tokenUserId?.trim() || fallbackUserId?.trim();
    return resolved || '9d131562-c443-43c1-af24-2a20356c44a4';
  }

  /**
   * Guarda el archivo directo en el disco compartido con `connection`
   * (CONNECTION_DOCUMENTS_UPLOAD_DIR) y retorna solo la referencia
   * (fileUrl + hash) para enviar por Kafka. Evita mandar el archivo
   * completo en base64 dentro del mensaje de Kafka.
   */
  private async saveDocumentToDisk(file: Express.Multer.File): Promise<{
    fileUrl: string;
    fileName: string;
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
    const extension = extname(safeBaseName) || '.jpg';
    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, fileName), file.buffer);

    return {
      fileUrl: `${environments.CONNECTION_DOCUMENTS_PUBLIC_PREFIX}/${fileName}`,
      fileName,
      mimeType: file.mimetype,
      sizeInBytes: file.size,
      hashSha256: createHash('sha256').update(file.buffer).digest('hex'),
    };
  }

  @Post('change')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary:
      'Change state of a water connection (with optional evidence upload)',
    description:
      'Performs a validated state transition for a connection, registering an immutable ledger history record and atomically synchronizing public.acometida. Allows uploading photo or document evidence.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        connectionId: {
          type: 'string',
          example: '14-293',
          description: 'Unique identifier of connection (acometida_id)',
        },
        newStateId: {
          type: 'number',
          example: 14,
          description: 'Target state ID from cat_estados_acometida (1 to 15)',
        },
        reason: {
          type: 'string',
          example: 'Corte de servicio por mora acumulada de 3 meses',
          description:
            'Operational justification or reason for state transition',
        },
        origin: {
          type: 'string',
          enum: [
            'WEB',
            'APP_MOVIL',
            'CUADRILLA',
            'SISTEMA',
            'INTEGRACION',
            'MIGRACION',
          ],
          default: 'WEB',
          description: 'Origin channel',
        },
        supportDocument: {
          type: 'string',
          example: 'OT-CORTE-2026-0045',
          description:
            'Supporting administrative or work order document identifier',
        },
        observations: {
          type: 'string',
          example:
            'Se colocó tapón roscado y precinto #P-4421. Lectura: 450 m3',
          description:
            'Technical notes or observations recorded by the crew/operator',
        },
        latitude: {
          type: 'number',
          example: 0.3542,
          description: 'WGS84 Latitude coordinate captured during field event',
        },
        longitude: {
          type: 'number',
          example: -78.1234,
          description: 'WGS84 Longitude coordinate captured during field event',
        },
        effectiveDate: {
          type: 'string',
          example: '2026-11-17T16:45:00.000Z',
          description:
            'Effective physical timestamp when the event occurred in the field',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Evidence photo or document (PDF, PNG, JPG, WEBP)',
        },
      },
      required: ['connectionId', 'newStateId', 'reason'],
    },
  })
  @SwaggerApiResponse({ status: 201, type: StateHistoryGatewayResponse })
  async changeConnectionState(
    @Body() body: ChangeConnectionStateGatewayRequest,
    @Req() request: Request,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse> {
    try {
      let supportDocument = body.supportDocument?.trim();
      let observations = body.observations?.trim() || '';

      if (file) {
        try {
          const host =
            process.env.DOCUMENTS_MICROSERVICE_HOST ||
            (environments.NODE_ENV === 'production'
              ? 'documents-service'
              : 'documents-service-dev');
          const port =
            Number(process.env.DOCUMENTS_MICROSERVICE_PORT) ||
            (environments.NODE_ENV === 'production' ? 3019 : 4019);
          const microserviceUrl = `http://${host}:${port}/documents/upload`;

          const formData = new FormData();
          const fileBlob = new Blob([new Uint8Array(file.buffer)], {
            type: file.mimetype,
          });
          formData.append('file', fileBlob, file.originalname);
          formData.append(
            'codigoTipoDocumento',
            [3, 4, 13, 14, 15, 5].includes(Number(body.newStateId))
              ? 'EVIDENCIA_SUSPENSION'
              : 'EVIDENCIA_CAMBIO_ESTADO',
          );
          formData.append('entityType', 'acometida');
          formData.append('entityId', String(body.connectionId).trim());
          formData.append(
            'uploadedBy',
            this.extractUserId(request, body.userId),
          );
          formData.append('nivelAcceso', 'PRIVADO');

          const uploadRes = await fetch(microserviceUrl, {
            method: 'POST',
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = (await uploadRes.json()) as any;
            const docId =
              uploadData.documento?.documento_id ||
              uploadData.documento_id ||
              uploadData.id;
            if (docId) {
              supportDocument = String(docId);
              const docUrl =
                uploadData.uploadUrl ||
                uploadData.downloadUrl ||
                uploadData.documento?.storage_path ||
                '';
              const evidenceNote = `[Evidencia Documento ID: ${docId}${docUrl ? ` (${docUrl})` : ''}]`;
              observations = observations
                ? `${observations} | ${evidenceNote}`
                : evidenceNote;
              this.logger.log(
                `✅ [GATEWAY -> DOCUMENTS] Evidence uploaded successfully. Document UUID: ${docId}`,
              );
            }
          } else {
            const errText = await uploadRes.text();
            this.logger.warn(
              `⚠️ [GATEWAY -> DOCUMENTS] Document upload returned HTTP ${uploadRes.status}: ${errText}`,
            );
          }
        } catch (uploadErr) {
          this.logger.error(
            `❌ [GATEWAY -> DOCUMENTS] Error forwarding evidence to documents microservice: ${(uploadErr as Error).message}`,
          );
        }
      }

      const newStateId = Number(body.newStateId);
      const latitude =
        body.latitude !== undefined &&
        body.latitude !== null &&
        !isNaN(Number(body.latitude))
          ? Number(body.latitude)
          : undefined;
      const longitude =
        body.longitude !== undefined &&
        body.longitude !== null &&
        !isNaN(Number(body.longitude))
          ? Number(body.longitude)
          : undefined;

      const payload: ChangeConnectionStateGatewayRequest = {
        connectionId: String(body.connectionId).trim(),
        newStateId,
        reason: String(body.reason).trim(),
        userId: this.extractUserId(request, body.userId),
        origin: body.origin || 'WEB',
        supportDocument,
        observations,
        latitude,
        longitude,
        effectiveDate: body.effectiveDate,
      };

      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'state_history.change' | Connection: ${payload.connectionId} -> Target State: ${payload.newStateId} | User: ${payload.userId} | Origin: ${payload.origin} | Evidence: ${payload.supportDocument ?? 'NONE'}`,
      );

      const result = await sendKafkaRequest<StateHistoryGatewayResponse>(
        this.kafkaProxy.send(this.kafkaClient, 'state_history.change', payload),
      );

      this.logger.log(
        `📥 [CLIENT-GATEWAY <- KAFKA] Response received for Connection: ${payload.connectionId} | New State: ${result.newStateName} (ID: ${result.newStateId}) | Ledger Historial ID: ${result.historialId}`,
      );

      return new ApiResponse(
        'Connection state changed successfully',
        result,
        request.url,
        201,
      );
    } catch (error) {
      this.logger.error('Error changing connection state', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Post('bulk-change')
  @ApiOperation({
    summary: 'Bulk state transition for multiple connections',
    description:
      'Executes a batch state transition across multiple connection IDs with canonical alphabetical locking to prevent PostgreSQL deadlocks.',
  })
  @SwaggerApiResponse({ status: 200, type: BulkStateChangeGatewayResponse })
  async bulkChangeConnectionState(
    @Body() body: BulkChangeConnectionStateGatewayRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const payload: BulkChangeConnectionStateGatewayRequest = {
        ...body,
        newStateId: Number(body.newStateId),
        userId: this.extractUserId(request, body.userId),
      };

      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'state_history.bulk_change' | Connections: ${payload.connectionIds.length} | Target State: ${payload.newStateId} | User: ${payload.userId}`,
      );

      const result = await sendKafkaRequest<BulkStateChangeGatewayResponse>(
        this.kafkaProxy.send(
          this.kafkaClient,
          'state_history.bulk_change',
          payload,
        ),
      );

      this.logger.log(
        `📥 [CLIENT-GATEWAY <- KAFKA] Response received for 'state_history.bulk_change' | Updated: ${result.totalUpdated}/${result.totalRequested} connections to state ${result.newStateName} (ID: ${result.newStateId})`,
      );

      return new ApiResponse(
        'Bulk state transition processed',
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error('Error in bulk connection state change', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Post('revert')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary:
      'Revert a previous erroneous state transition (with optional evidence)',
    description:
      'Compensatory undo operation. Creates an audit reversal record (es_reverso=true) and returns connection to its former state. Allows attaching supervisory authorization document.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        historialId: {
          type: 'number',
          example: 16071,
          description:
            'Unique ID of the erroneous history record (historial_id) to revert',
        },
        reason: {
          type: 'string',
          example:
            'Se cortó predio equivocado; se subsana error de cuadrilla en campo',
          description: 'Detailed operational reason justifying the reversal',
        },
        supportDocument: {
          type: 'string',
          example: 'RES-SUPERVISOR-2026-009',
          description:
            'Administrative approval file or supervisor resolution identifier',
        },
        observations: {
          type: 'string',
          example: 'Se restablece servicio inmediatamente en sitio',
          description: 'Supervisor audit comments',
        },
        origin: {
          type: 'string',
          enum: ['WEB', 'APP_MOVIL', 'SISTEMA', 'CUADRILLA'],
          default: 'WEB',
          description: 'Origin channel',
        },
        latitude: { type: 'number', example: 0.3542 },
        longitude: { type: 'number', example: -78.1234 },
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Supporting supervisor resolution or evidence file (PDF, JPG, PNG)',
        },
      },
      required: ['historialId', 'reason'],
    },
  })
  @SwaggerApiResponse({ status: 200, type: StateHistoryGatewayResponse })
  async revertStateHistory(
    @Body() body: RevertStateHistoryGatewayRequest,
    @Req() request: Request,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse> {
    try {
      let supportDocument = body.supportDocument?.trim();
      let observations = body.observations?.trim() || '';

      if (file) {
        try {
          const stored = await this.saveDocumentToDisk(file);
          if (!supportDocument) {
            // documento_respaldo es varchar(50) en PostgreSQL
            supportDocument = stored.fileName;
          }
          const evidenceNote = `[Evidencia reverso: ${stored.fileUrl} (${file.originalname}) sha256:${stored.hashSha256.slice(0, 8)}]`;
          observations = observations
            ? `${observations} | ${evidenceNote}`
            : evidenceNote;
        } catch (fileErr) {
          this.logger.warn(
            `Could not persist revert evidence to disk: ${(fileErr as Error).message}`,
          );
          if (!supportDocument) {
            supportDocument = file.originalname.slice(0, 50);
          }
          observations = observations
            ? `${observations} | [Evidencia reverso: ${file.originalname}]`
            : `[Evidencia reverso: ${file.originalname}]`;
        }
      }

      const historialId = Number(body.historialId);
      const latitude =
        body.latitude !== undefined &&
        body.latitude !== null &&
        !isNaN(Number(body.latitude))
          ? Number(body.latitude)
          : undefined;
      const longitude =
        body.longitude !== undefined &&
        body.longitude !== null &&
        !isNaN(Number(body.longitude))
          ? Number(body.longitude)
          : undefined;

      const payload: RevertStateHistoryGatewayRequest = {
        historialId,
        reason: String(body.reason).trim(),
        userId: this.extractUserId(request, body.userId),
        origin: body.origin || 'WEB',
        supportDocument,
        observations,
        latitude,
        longitude,
      };

      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'state_history.revert' | Target Historial ID: ${payload.historialId} | User: ${payload.userId} | Origin: ${payload.origin} | Evidence: ${payload.supportDocument ?? 'NONE'}`,
      );

      const result = await sendKafkaRequest<StateHistoryGatewayResponse>(
        this.kafkaProxy.send(this.kafkaClient, 'state_history.revert', payload),
      );

      this.logger.log(
        `📥 [CLIENT-GATEWAY <- KAFKA] Response received for 'state_history.revert' | Connection: ${result.connectionId} reverted back to ${result.newStateName} (ID: ${result.newStateId}) | Reversal Historial ID: ${result.historialId}`,
      );

      return new ApiResponse(
        'State transition reverted successfully',
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error(
        `Error reverting state history ID ${body.historialId}`,
        error,
      );
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('connection/:connectionId')
  @ApiOperation({
    summary: 'Get chronological state history of a connection',
    description:
      'Returns paginated state transitions for a given connection, ordered from most recent to oldest.',
  })
  async getConnectionHistory(
    @Param('connectionId') connectionId: string,
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'state_history.get_by_connection' | Connection: ${connectionId} | Limit: ${limit ?? 50} | Offset: ${offset ?? 0}`,
      );
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'state_history.get_by_connection',
          {
            connectionId,
            limit: limit !== undefined ? Number(limit) : 50,
            offset: offset !== undefined ? Number(offset) : 0,
          },
        ),
      );

      return new ApiResponse(
        `History for connection ${connectionId} retrieved successfully`,
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving history for connection ${connectionId}`,
        error,
      );
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('connection/:connectionId/current')
  @ApiOperation({
    summary: 'Get current state information of a connection',
    description:
      'Returns current catalog state, legacy boolean status, and latest transition metadata.',
  })
  @SwaggerApiResponse({
    status: 200,
    type: CurrentConnectionStateGatewayResponse,
  })
  async getCurrentConnectionState(
    @Param('connectionId') connectionId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'state_history.get_current_state' | Connection: ${connectionId}`,
      );
      const result =
        await sendKafkaRequest<CurrentConnectionStateGatewayResponse>(
          this.kafkaProxy.send(
            this.kafkaClient,
            'state_history.get_current_state',
            { connectionId },
          ),
        );

      return new ApiResponse(
        `Current state for connection ${connectionId} retrieved successfully`,
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving current state for connection ${connectionId}`,
        error,
      );
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('detail/:historialId')
  @ApiOperation({
    summary: 'Get single state history record by ID',
    description:
      'Retrieves complete forensic metadata of an individual state transition ledger row.',
  })
  @SwaggerApiResponse({ status: 200, type: StateHistoryGatewayResponse })
  async getStateHistoryById(
    @Param('historialId', ParseIntPipe) historialId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'state_history.get_by_id' | Historial ID: ${historialId}`,
      );
      const result = await sendKafkaRequest<StateHistoryGatewayResponse>(
        this.kafkaProxy.send(this.kafkaClient, 'state_history.get_by_id', {
          historialId,
        }),
      );

      return new ApiResponse(
        `State history record #${historialId} retrieved successfully`,
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving history record #${historialId}`,
        error,
      );
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('by-state/:stateId')
  @ApiOperation({
    summary: 'Get connections currently in a specific state',
    description:
      'Paginated listing of connections currently holding the designated state ID (e.g. 14 for INACTIVA).',
  })
  async getConnectionsByState(
    @Param('stateId', ParseIntPipe) stateId: number,
    @Req() request: Request,
    @Query('sectorId') sectorId?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'state_history.get_connections_by_state' | State ID: ${stateId} | Sector: ${sectorId ?? 'ALL'} | Limit: ${limit ?? 50}`,
      );
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'state_history.get_connections_by_state',
          {
            stateId,
            sectorId: sectorId ? Number(sectorId) : undefined,
            limit: limit !== undefined ? Number(limit) : 50,
            offset: offset !== undefined ? Number(offset) : 0,
          },
        ),
      );

      return new ApiResponse(
        `Connections in state ${stateId} retrieved successfully`,
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving connections in state ${stateId}`,
        error,
      );
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('catalog')
  @ApiOperation({
    summary: 'Get official 15-state catalog',
    description:
      'Retrieves all official connection states from public.cat_estados_acometida with operational flags.',
  })
  @SwaggerApiResponse({ status: 200, type: [StateCatalogGatewayResponse] })
  async getStateCatalog(@Req() request: Request): Promise<ApiResponse> {
    try {
      this.logger.log(`📤 [CLIENT-GATEWAY -> KAFKA] Sending 'state_history.get_catalog'`);
      const result = await sendKafkaRequest<StateCatalogGatewayResponse[]>(
        this.kafkaProxy.send(this.kafkaClient, 'state_history.get_catalog', {}),
      );

      return new ApiResponse(
        'State catalog retrieved successfully',
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error('Error retrieving state catalog', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('catalog/:stateId')
  @ApiOperation({
    summary: 'Get state catalog entry by ID',
    description:
      'Retrieves single state definition and operational parameters.',
  })
  @SwaggerApiResponse({ status: 200, type: StateCatalogGatewayResponse })
  async getStateCatalogById(
    @Param('stateId', ParseIntPipe) stateId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`📤 [CLIENT-GATEWAY -> KAFKA] Sending 'state_history.get_catalog_by_id' | State ID: ${stateId}`);
      const result = await sendKafkaRequest<StateCatalogGatewayResponse>(
        this.kafkaProxy.send(
          this.kafkaClient,
          'state_history.get_catalog_by_id',
          { stateId },
        ),
      );

      return new ApiResponse(
        `Catalog entry ${stateId} retrieved successfully`,
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error(`Error retrieving catalog state #${stateId}`, error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get system-wide state summary and KPI breakdown',
    description:
      'Calculates live counts and percentage distributions for each state across all connections in the database.',
  })
  @SwaggerApiResponse({ status: 200, type: [StateSummaryGatewayResponse] })
  async getStateSummary(@Req() request: Request): Promise<ApiResponse> {
    try {
      this.logger.log(`📤 [CLIENT-GATEWAY -> KAFKA] Sending 'state_history.get_summary'`);
      const result = await sendKafkaRequest<StateSummaryGatewayResponse[]>(
        this.kafkaProxy.send(this.kafkaClient, 'state_history.get_summary', {}),
      );

      return new ApiResponse(
        'State summary dashboard retrieved successfully',
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error('Error retrieving state summary', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Post('filter')
  @ApiOperation({
    summary: 'Search and filter state history events',
    description:
      'Multi-criteria query for forensic auditing. Filters by connectionId, stateId, userId, origin, date range, and reversal status.',
  })
  async filterStateHistory(
    @Body() body: FilterStateHistoryGatewayRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'state_history.filter' | Connection: ${body.connectionId ?? 'ALL'} | State: ${body.stateId ?? 'ALL'} | User: ${body.userId ?? 'ALL'}`,
      );
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'state_history.filter', body),
      );

      return new ApiResponse(
        'State history search completed',
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error('Error filtering state history', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('allowed-transitions/:connectionId')
  @ApiOperation({
    summary: 'Get permissible target states for a connection',
    description:
      'Evaluates the official 15x15 transition matrix and returns which states are allowed, restricted, or forbidden from the connection current state. Essential for populating frontend dropdowns.',
  })
  @SwaggerApiResponse({ status: 200, type: AllowedTransitionsGatewayResponse })
  async getAllowedTransitions(
    @Param('connectionId') connectionId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'state_history.get_allowed_transitions' | Connection: ${connectionId}`,
      );
      const result = await sendKafkaRequest<AllowedTransitionsGatewayResponse>(
        this.kafkaProxy.send(
          this.kafkaClient,
          'state_history.get_allowed_transitions',
          { connectionId },
        ),
      );

      return new ApiResponse(
        `Allowed transitions for connection ${connectionId} retrieved successfully`,
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving allowed transitions for connection ${connectionId}`,
        error,
      );
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('reversible/:connectionId')
  @ApiOperation({
    summary: 'Check if a connection has an active transition eligible for reversal',
    description:
      'Evaluates whether the connection latest state change can be safely reverted under the audit rules (must be latest event, not previously undone).',
  })
  @SwaggerApiResponse({ status: 200, type: ReversibleRecordGatewayResponse })
  async getReversibleHistory(
    @Param('connectionId') connectionId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'state_history.get_reversible' | Connection: ${connectionId}`,
      );
      const result = await sendKafkaRequest<ReversibleRecordGatewayResponse>(
        this.kafkaProxy.send(
          this.kafkaClient,
          'state_history.get_reversible',
          { connectionId },
        ),
      );

      return new ApiResponse(
        `Reversibility status for connection ${connectionId} retrieved successfully`,
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error(
        `Error querying reversibility for connection ${connectionId}`,
        error,
      );
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('geo-events')
  @ApiOperation({
    summary: 'Get geospatial state change events in PostGIS GeoJSON format',
    description:
      'Returns a GeoJSON FeatureCollection containing all georeferenced field state transitions (e.g., cuts, reconnections, frauds). Ideal for GIS map visualization on Leaflet or Mapbox.',
  })
  @SwaggerApiResponse({ status: 200, type: StateEventsGeoJSONGatewayResponse })
  async getStateEventsGeoJSON(
    @Req() request: Request,
    @Query('stateId') stateId?: number,
    @Query('sectorId') sectorId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'state_history.get_geo_events' | State: ${stateId ?? 'ALL'} | Sector: ${sectorId ?? 'ALL'}`,
      );
      const result = await sendKafkaRequest<StateEventsGeoJSONGatewayResponse>(
        this.kafkaProxy.send(
          this.kafkaClient,
          'state_history.get_geo_events',
          {
            stateId: stateId ? Number(stateId) : undefined,
            sectorId: sectorId ? Number(sectorId) : undefined,
            startDate,
            endDate,
          },
        ),
      );

      return new ApiResponse(
        'Geospatial state events retrieved successfully',
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error('Error retrieving geospatial state events', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }
}
