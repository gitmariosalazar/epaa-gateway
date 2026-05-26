import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import axios from 'axios';
import {
  UploadDocumentDto,
  CreateDocumentDto,
  AssociateDocumentDto,
  UpdateDocumentStateDto,
  DocumentResponseDto,
  EntityRelationType,
} from '../../application/dtos/documento.dto';

@Controller('Documents')
@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class DocumentsGatewayController {
  private readonly logger: Logger = new Logger(DocumentsGatewayController.name);

  constructor(
    @Inject(environments.GATEWAY_DOCUMENTS_KAFKA_CLIENT)
    private readonly documentsClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadDocumentDto })
  @ApiOperation({
    summary: 'Method POST - Direct physical file upload from Swagger/client',
    description:
      'Accepts physical multipart files and forwards them directly to the documents microservice REST API.',
  })
  async uploadDirect(
    @Body() body: any,
    @UploadedFile() file: any,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      if (!file) {
        throw new RpcException({
          statusCode: 400,
          message: 'Debe seleccionar un archivo físico en el parámetro "file".',
        });
      }

      // Obtener el ID del usuario desde el JWT expuesto por AuthGuard
      const uploadedBy =
        (request as any)['user']?.sub ?? (request as any)['user']?.userId;

      // Crear FormData y adjuntar el Buffer del archivo de forma binaria
      const formData = new FormData();
      const fileBlob = new Blob([file.buffer], { type: file.mimetype });
      formData.append('file', fileBlob, file.originalname);
      formData.append('codigoTipoDocumento', body.codigoTipoDocumento);

      if (body.nivelAcceso) formData.append('nivelAcceso', body.nivelAcceso);
      if (uploadedBy) formData.append('uploadedBy', uploadedBy);
      if (body.entityType) formData.append('entityType', body.entityType);
      if (body.entityId) formData.append('entityId', String(body.entityId));

      if (body.rolesPermitidos) {
        let roles = body.rolesPermitidos;
        if (typeof roles === 'string') {
          const trimmed = roles.trim();
          if (!trimmed.startsWith('[')) {
            roles = trimmed
              .split(',')
              .map((r: string) => r.trim())
              .filter(Boolean);
          } else {
            try {
              roles = JSON.parse(trimmed);
            } catch {
              roles = [trimmed];
            }
          }
        }
        formData.append('rolesPermitidos', JSON.stringify(roles));
      }

      if (body.metadatosExtras) {
        let meta = body.metadatosExtras;
        if (typeof meta === 'string') {
          const trimmed = meta.trim();
          if (!trimmed.startsWith('{')) {
            meta = { observacion: trimmed };
          } else {
            try {
              meta = JSON.parse(trimmed);
            } catch {
              meta = { raw: trimmed };
            }
          }
        }
        formData.append('metadatosExtras', JSON.stringify(meta));
      }

      // En entorno Docker-compose, 'localhost' apunta al propio contenedor del gateway.
      // Debemos apuntar al alias DNS del contenedor del microservicio de documentos: 'documents-service-dev'
      const host =
        process.env.DOCUMENTS_MICROSERVICE_HOST ||
        (environments.NODE_ENV === 'production'
          ? 'documents-service'
          : 'documents-service-dev');
      const port =
        Number(process.env.DOCUMENTS_MICROSERVICE_PORT) ||
        (environments.NODE_ENV === 'production' ? 3019 : 4019);
      const microserviceUrl = `http://${host}:${port}/documents/upload`;

      this.logger.log(
        `Forwarding physical file upload to microservice at ${microserviceUrl}`,
      );

      const response = await axios.post(microserviceUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return new ApiResponse(
        'Document uploaded and registered successfully!',
        response.data,
        request.url,
      );
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(
        `Error uploading physical document through gateway: ${err.message}`,
        err.stack,
      );
      if (error.response) {
        throw new RpcException(error.response.data);
      }
      throw new RpcException(err as string | object);
    }
  }

  @Get('types')
  @ApiOperation({
    summary: 'Method GET - Retrieve document types catalog',
    description:
      'Returns all active document types with size and extension constraints.',
  })
  async getTypes(@Req() request: Request): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.documentsClient, 'documents.get-types', {}),
      );
      return new ApiResponse(
        'Document types catalog retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving document types: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('presigned-url')
  @ApiOperation({
    summary: 'Method POST - Generate secure pre-signed upload URL',
    description:
      'Registers document metadata and returns a temporary upload URL for client-direct uploads.',
  })
  async generatePresignedUrl(
    @Body() dto: CreateDocumentDto,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const uploadedBy =
        (request as any)['user']?.sub ?? (request as any)['user']?.userId;
      const payload = { ...dto, uploadedBy };

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.documentsClient,
          'documents.create-metadata',
          payload,
        ),
      );
      return new ApiResponse(
        'Pre-signed upload URL generated successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error generating pre-signed URL: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Method GET - Get document metadata by ID',
    description:
      'Retrieves document details and a fresh, secure temporary download URL.',
  })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  async getById(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: DocumentResponseDto = await sendKafkaRequest(
        this.kafkaProxy.send(this.documentsClient, 'documents.get-by-id', id),
      );
      return new ApiResponse(
        `Document with ID ${id} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving document by ID ${id}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Patch(':id/state')
  @ApiOperation({
    summary: 'Method PATCH - Update document validation state',
    description:
      'Transitions a document validation state (CARGADO -> EN_VALIDACION -> APROBADO/RECHAZADO).',
  })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  async updateState(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentStateDto,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const realizadoPor =
        (request as any)['user']?.sub ?? (request as any)['user']?.userId;
      const payload = { id, dto: { ...dto, realizadoPor } };

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.documentsClient,
          'documents.update-state',
          payload,
        ),
      );
      return new ApiResponse(
        `Document validation state updated successfully to ${dto.estado}!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error updating validation state of document ${id}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post(':id/associate')
  @ApiOperation({
    summary: 'Method POST - Associate document with business entity',
    description:
      'Attaches the document to a specific business model (e.g. predio, solicitud, factura, acometida).',
  })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  async associate(
    @Param('id') id: string,
    @Body() dto: AssociateDocumentDto,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const payload = { id, dto };
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.documentsClient,
          'documents.associate',
          payload,
        ),
      );
      return new ApiResponse(
        `Document associated with ${dto.entityType} ID ${dto.entityId} successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error associating document ${id} with ${dto.entityType}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('entity/:type/:id')
  @ApiOperation({
    summary:
      'Method GET - Retrieve all documents associated with a business entity',
    description: 'Finds all documents linked to an entity type and ID.',
  })
  @ApiParam({
    name: 'type',
    description:
      'Entity type (solicitud, predio, orden_trabajo, acometida, factura, lectura, usuarios)',
  })
  @ApiParam({ name: 'id', description: 'Target entity ID' })
  async getByEntity(
    @Param('type') type: EntityRelationType,
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const payload = { type, id };
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.documentsClient,
          'documents.get-by-entity',
          payload,
        ),
      );
      return new ApiResponse(
        `Documents associated with ${type} ID ${id} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving documents for ${type} ID ${id}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
