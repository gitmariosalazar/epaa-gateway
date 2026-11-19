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
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { createHash, randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { basename, extname, join } from 'path';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { AccessTokenPayload } from '../../../../../../shared/utils/interfaces/user.payload';
import {
  BulkStateChangeResponse,
  ConnectionsByStateResponse,
  ConnectionStateHistoryResponse,
  ConnectionStateResponse,
  StateSummaryResponse,
} from '../../domain/schemas/dto/response/connection-state.response';
import {
  BulkChangeConnectionStateRequest,
  ChangeConnectionStateRequest,
} from '../../domain/schemas/dto/request/change-state.connection.request';

@Controller('connections/state')
@ApiTags('Connections — State Management')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ConnectionStateGatewayController {
  private readonly logger: Logger = new Logger(
    ConnectionStateGatewayController.name,
  );

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly connectionKafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  // ── State Summary Dashboard ────────────────────────────────────────────────

  @Get('summary-dashboard')
  @ApiOperation({
    summary: 'Method GET - Connection state KPI summary',
    description:
      'Returns a breakdown of how many connections are in each state, with percentages. Ideal for executive dashboards.',
  })
  async getStateSummaryDashboard(
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`📤 [CLIENT-GATEWAY -> KAFKA] Sending 'connections.get-state-summary-dashboard'`);
      const response: StateSummaryResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(this.connectionKafkaClient, 
          'connections.get-state-summary-dashboard', {},
        ),
      );
      this.logger.log(`📥 [CLIENT-GATEWAY <- KAFKA] Received dashboard state summary with ${response?.length ?? 0} state buckets`);
      return new ApiResponse(
        'Connection state summary retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  // ── Get Connections by State ───────────────────────────────────────────────

  @Get('by-state/:stateId')
  @ApiOperation({
    summary: 'Method GET - List connections by state',
    description:
      'Returns all connections currently in a given state (e.g. CORTADA_POR_MORA). Supports optional sector filter and pagination.',
  })
  async getConnectionsByState(
    @Req() request: Request,
    @Param('stateId', ParseIntPipe) stateId: number,
    @Query('sector') sector?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'connections.get-connections-by-state' | State ID: ${stateId} | Sector: ${sector ?? 'ALL'} | Limit: ${limit ?? 100}`,
      );
      const response: ConnectionsByStateResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(this.connectionKafkaClient, 
          'connections.get-connections-by-state', {
            stateId,
            sector: sector ? Number(sector) : undefined,
            limit: limit ? Number(limit) : 100,
            offset: offset ? Number(offset) : 0,
          },
        ),
      );
      this.logger.log(
        `📥 [CLIENT-GATEWAY <- KAFKA] Received ${response?.length ?? 0} connections for state ${stateId}`,
      );
      return new ApiResponse(
        `Connections in state ${stateId} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  // ── State History ──────────────────────────────────────────────────────────

  @Get('history/:connectionId')
  @ApiOperation({
    summary: 'Method GET - Connection state history',
    description:
      'Returns the full audit trail of state changes for a specific connection, ordered by most recent first.',
  })
  async getConnectionStateHistory(
    @Req() request: Request,
    @Param('connectionId') connectionId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'connections.get-connection-state-history' | Connection: ${connectionId} | Limit: ${limit ?? 50}`,
      );
      const response: ConnectionStateHistoryResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(this.connectionKafkaClient, 
          'connections.get-connection-state-history', {
            connectionId,
            limit: limit ? Number(limit) : 50,
            offset: offset ? Number(offset) : 0,
          },
        ),
      );
      this.logger.log(
        `📥 [CLIENT-GATEWAY <- KAFKA] Received ${response?.length ?? 0} history records for connection ${connectionId}`,
      );
      return new ApiResponse(
        `State history for connection ${connectionId} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
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

  // ── Change State ───────────────────────────────────────────────────────────

  @Post('change')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary: 'Method POST - Change connection state (with evidence upload)',
    description:
      'Changes the state of a single connection (e.g. suspend, reconnect, flag as fraud). User is automatically extracted from JWT token. Allows uploading photo or document evidence.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        connectionId: {
          type: 'string',
          example: '14-293',
          description: 'ID de la acometida',
        },
        newStateId: {
          type: 'number',
          example: 14,
          description: 'ID del nuevo estado en catálogo (1 a 15)',
        },
        motivo: {
          type: 'string',
          example: 'Corte por mora de 3 planillas vencidas',
          description: 'Motivo u justificación obligatoria del cambio',
        },
        detallesTecnicos: {
          type: 'object',
          example: {},
          description: 'Detalles técnicos u observaciones adicionales (opcional)',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Foto del medidor/corte o documento de respaldo (PDF, JPG, PNG)',
        },
      },
      required: ['connectionId', 'newStateId', 'motivo'],
    },
  })
  async changeConnectionState(
    @Req() request: Request,
    @Body() body: ChangeConnectionStateRequest,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse> {
    try {
      const userId = this.extractUserId(request, body.userId);
      let motivo = String(body.motivo || '').trim();
      let detallesTecnicos: Record<string, unknown> = {};

      if (body.detallesTecnicos) {
        if (typeof body.detallesTecnicos === 'string') {
          try {
            detallesTecnicos = JSON.parse(body.detallesTecnicos);
          } catch {
            detallesTecnicos = { raw: body.detallesTecnicos };
          }
        } else if (typeof body.detallesTecnicos === 'object') {
          detallesTecnicos = { ...body.detallesTecnicos };
        }
      }

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
          formData.append('uploadedBy', userId);
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
              detallesTecnicos.evidencia = String(docId);
              detallesTecnicos.documento_respaldo = String(docId);
              detallesTecnicos.supportDocument = String(docId);
              const docUrl =
                uploadData.uploadUrl ||
                uploadData.downloadUrl ||
                uploadData.documento?.storage_path ||
                '';
              motivo = `${motivo} [Evidencia Documento ID: ${docId}${docUrl ? ` (${docUrl})` : ''}]`;
              this.logger.log(
                `✅ [GATEWAY -> DOCUMENTS] Evidence uploaded successfully for connection ${body.connectionId}. Document UUID: ${docId}`,
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

      const payload: ChangeConnectionStateRequest = {
        connectionId: String(body.connectionId).trim(),
        newStateId: Number(body.newStateId),
        userId,
        motivo,
        detallesTecnicos,
      };

      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'connections.change-connection-state' | Connection: ${payload.connectionId} -> Target State: ${payload.newStateId} | User: ${userId} | Evidence: ${detallesTecnicos.evidencia ?? 'NONE'}`,
      );
      const response: ConnectionStateResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.change-connection-state',
          payload,
        ),
      );
      this.logger.log(
        `📥 [CLIENT-GATEWAY <- KAFKA] State change successful for Connection: ${payload.connectionId} | New State: ${response.currentStateName} (ID: ${response.currentStateId})`,
      );
      return new ApiResponse(
        `Connection state changed successfully to ${response.currentStateName}!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  // ── Bulk State Change ──────────────────────────────────────────────────────

  @Post('bulk-change')
  @ApiOperation({
    summary: 'Method POST - Bulk connection state change',
    description:
      'Changes the state of multiple connections in a single operation. User is automatically extracted from JWT token.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        connectionIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['14-293', '10-114'],
          description: 'Lista de IDs de acometidas',
        },
        newStateId: {
          type: 'number',
          example: 3,
          description: 'ID del nuevo estado',
        },
        motivo: {
          type: 'string',
          example: 'Campaña masiva de corte por morosidad',
          description: 'Motivo del cambio en bloque',
        },
      },
      required: ['connectionIds', 'newStateId', 'motivo'],
    },
  })
  async bulkChangeConnectionState(
    @Req() request: Request,
    @Body() body: BulkChangeConnectionStateRequest,
  ): Promise<ApiResponse> {
    try {
      const userId = this.extractUserId(request, body.userId);
      const payload: BulkChangeConnectionStateRequest = {
        ...body,
        newStateId: Number(body.newStateId),
        userId,
      };

      this.logger.log(
        `📤 [CLIENT-GATEWAY -> KAFKA] Sending 'connections.bulk-change-connection-state' | Connections: ${payload.connectionIds.length} | Target State: ${payload.newStateId} | User: ${userId}`,
      );
      const response: BulkStateChangeResponse = await sendKafkaRequest(
        this.kafkaProxy.send(this.connectionKafkaClient, 
          'connections.bulk-change-connection-state', payload,
        ),
      );
      this.logger.log(
        `📥 [CLIENT-GATEWAY <- KAFKA] Bulk state change response: ${response.updatedCount} connections updated to ${response.stateName}`,
      );
      return new ApiResponse(
        `Bulk state change completed: ${response.updatedCount} connections updated to ${response.stateName}!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }
}
