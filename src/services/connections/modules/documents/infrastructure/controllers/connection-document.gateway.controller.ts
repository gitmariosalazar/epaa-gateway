import {
  Body,
  Controller,
  Param,
  Get,
  Inject,
  Logger,
  Post,
  Put,
  Query,
  Req,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { CreateConnectionDocumentRequest } from '../../domain/dto/request/create-connection-document.request';
import { UpdateConnectionDocumentRequest } from '../../domain/dto/request/update-connection-document.request';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('connection-documents')
@ApiTags('connection-documents')
export class ConnectionDocumentGatewayController {
  private readonly logger: Logger = new Logger(
    ConnectionDocumentGatewayController.name,
  );

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {
    this.logger.log('ConnectionDocumentGatewayController initialized');
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        requestId: { type: 'string' },
        documentTypeId: { type: 'number' },
        originalName: { type: 'string' },
        validationStatus: {
          type: 'string',
          enum: ['VALIDO', 'INVALIDO', 'PENDIENTE'],
        },
        observation: { type: 'string' },
        //validatorId: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['requestId', 'documentTypeId', 'validationStatus', 'file'],
    },
  })
  @ApiOperation({
    summary: 'Create a new connection document',
    description:
      'This endpoint allows you to create a new connection document by providing the necessary details in the request body.',
  })
  async createConnectionDocument(
    @Body() createDocument: CreateConnectionDocumentRequest,
    @Req() request: Request,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse> {
    try {
      const payload: CreateConnectionDocumentRequest = {
        ...createDocument,
        originalName: createDocument.originalName || file?.originalname || '',
        mimeType: createDocument.mimeType || file?.mimetype,
        fileBase64: file
          ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
          : createDocument.fileBase64,
      };

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'connection-documents.create',
          payload,
        ),
      );
      return new ApiResponse(
        `Connection document created successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error('Error creating connection document', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Put(':documentId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        requestId: { type: 'string' },
        documentTypeId: { type: 'number' },
        originalName: { type: 'string' },
        validationStatus: {
          type: 'string',
          enum: ['VALIDO', 'INVALIDO', 'PENDIENTE'],
        },
        observation: { type: 'string' },
        validatorId: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({
    summary: 'Update an existing connection document',
    description:
      'This endpoint allows you to update an existing connection document by providing the document ID and the updated details in the request body.',
  })
  async updateConnectionDocument(
    @Param('documentId') documentId: string,
    @Body() updateData: UpdateConnectionDocumentRequest,
    @Req() request: Request,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse> {
    try {
      const payloadUpdateData: UpdateConnectionDocumentRequest = {
        ...updateData,
        originalName: updateData.originalName || file?.originalname,
        mimeType: updateData.mimeType || file?.mimetype,
        fileBase64: file
          ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
          : updateData.fileBase64,
      };

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'connection-documents.update', {
          documentId,
          updateData: payloadUpdateData,
        }),
      );
      return new ApiResponse(
        `Connection document updated successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error('Error updating connection document', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get(':documentId')
  @ApiOperation({
    summary: 'Get a connection document by ID',
    description:
      'This endpoint allows you to retrieve a specific connection document by providing its unique ID as a query parameter.',
  })
  async getConnectionDocumentById(
    @Param('documentId') documentId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'connection-documents.get_by_id',
          documentId,
        ),
      );
      return new ApiResponse(
        `Connection document with ID ${documentId} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error('Error retrieving connection document by ID', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all connection documents',
    description:
      'This endpoint allows you to retrieve all connection documents with pagination by providing limit and offset as query parameters.',
  })
  async getAllConnectionDocuments(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'connection-documents.get_all', {
          limit,
          offset,
        }),
      );
      return new ApiResponse(
        `Connection documents retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error('Error retrieving all connection documents', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('by-client/:clientId')
  @ApiOperation({
    summary: 'Get connection documents by client ID',
    description:
      'This endpoint allows you to retrieve connection documents associated with a specific client ID, with pagination support.',
  })
  async getConnectionDocumentsByClientId(
    @Param('clientId') clientId: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'connection-documents.get_by_client_id',
          { clientId, limit, offset },
        ),
      );
      return new ApiResponse(
        `Connection documents for client ID ${clientId} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving connection documents for client ID ${clientId}`,
        error,
      );
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('by-request/:requestId')
  @ApiOperation({
    summary: 'Get connection documents by request ID',
    description:
      'This endpoint allows you to retrieve connection documents associated with a specific request ID, with pagination support.',
  })
  async getConnectionDocumentsByRequestId(
    @Param('requestId') requestId: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'connection-documents.get_by_request_id',
          { requestId, limit, offset },
        ),
      );
      return new ApiResponse(
        `Connection documents for request ID ${requestId} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving connection documents for request ID ${requestId}`,
        error,
      );
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Delete(':documentId')
  async deleteConnectionDocument(
    @Param('documentId') documentId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    // Implement the logic to handle the deletion of a connection document
    try {
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'connection-documents.delete',
          documentId,
        ),
      );
      return new ApiResponse(
        `Connection document with ID ${documentId} deleted successfully!`,
        { success: result },
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting connection document with ID ${documentId}`,
        error,
      );
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }
}
