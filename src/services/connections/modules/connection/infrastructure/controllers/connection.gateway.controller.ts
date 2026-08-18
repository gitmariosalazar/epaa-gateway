import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { environments } from '../../../../../../settings/environments/environments';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { CreateConnectionRequest } from '../../domain/schemas/dto/request/create.connection.request';
import { MeterChangeDetail } from '../../domain/schemas/dto/request/change-meter.connection.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { AllowedUserTypes } from '../../../../../../auth/decorator/allowed-user-types.decorator';
import {
  ConnectionAndPropertyResponse,
  ConnectionResponse,
  PropertyWithClientResponse,
} from '../../domain/schemas/dto/response/connection.response';
import {
  ClientDashboardResponse,
  ConnectionDashboardResponse,
} from '../../domain/schemas/dto/response/view-dashboard.response';

@Controller('connections')
@ApiTags('Connections Gateway')
//@ApiBearerAuth()
//@UseGuards(AuthGuard)
export class ConnectionGatewayController {
  private readonly logger: Logger = new Logger(
    ConnectionGatewayController.name,
  );

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly connectionKafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Get('dashboard/advancement-stats')
  @ApiOperation({
    summary: 'Method GET - Get advancement dashboard stats',
    description:
      'Retrieves consolidated stats for the connections advancement dashboard',
  })
  async getAdvanceDashboardStats(
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Received request to get advancement dashboard stats`);
      const response: any = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.get-advance-dashboard-stats',
          {},
        ),
      );
      return new ApiResponse(
        `Dashboard stats retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('get-customer-dashboard/:clientId')
  @ApiOperation({
    summary: 'Method GET - Get customer dashboard',
    description: 'Retrieves consolidated dashboard for a specific client',
  })
  async getCustomerDashboard(
    @Req() request: Request,
    @Param('clientId') clientId: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to get customer dashboard for client ID: ${clientId}`,
      );
      const response: any = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.get-customer-dashboard',
          clientId,
        ),
      );
      return new ApiResponse(
        `Customer dashboard retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('live-update-map-connections')
  @ApiOperation({
    summary: 'Method GET - Get live update map connections',
    description: 'Retrieves live update map connections',
  })
  async getLiveUpdateMapConnections(
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Received request to get live update map connections`);
      const response: any = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.get-live-update-map-connections',
          {},
        ),
      );
      return new ApiResponse(
        `Live update map connections retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Post('create-connection')
  @ApiOperation({
    summary: 'Method POST - Create a new connection',
    description:
      'The endpoint allows you to create a new connection in the system',
  })
  async createConnection(
    @Req() request: Request,
    @Body() connection: CreateConnectionRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to create connection: ${JSON.stringify(connection)}`,
      );
      const response: ConnectionResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.create-connection',
          connection,
        ),
      );
      return new ApiResponse(
        `Connection created successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Put('update-connection/:connectionId')
  @ApiOperation({
    summary: 'Method PUT - Update an existing connection',
    description:
      'The endpoint allows you to update an existing connection in the system',
  })
  async updateConnection(
    @Req() request: Request,
    @Param('connectionId') connectionId: string,
    @Body() connection: CreateConnectionRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to update connection ${connectionId}: ${JSON.stringify(connection)}`,
      );
      const response: ConnectionResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.update-connection',
          {
            connectionId,
            connection,
          },
        ),
      );
      return new ApiResponse(
        `Connection updated successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Post('change-meter/:connectionId')
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['changeDetail'],
      properties: {
        changeDetail: {
          type: 'string',
          description:
            'JSON string con MeterChangeDetail (clave_catastral, numero_medidor, serie, ubicacion, observaciones, medidor_anterior, medidor_nuevo). medidor_nuevo.numero_medidor es obligatorio.',
          example:
            '{"clave_catastral":"","numero_medidor":"","serie":"","ubicacion":"","observaciones":"","medidor_anterior":{"numero_medidor":"MTR-123456","ultima_lectura":1520,"fecha_ultima_lectura":"2026-07-15T00:00:00.000Z"},"medidor_nuevo":{"numero_medidor":"MTR-789012","lectura_anterior":1520,"lectura_actual":0,"fecha_ultima_lectura":"2026-08-17T00:00:00.000Z"}}',
        },
        imageDescriptions: {
          type: 'string',
          description:
            'JSON string con un array de descripciones alineado por índice a "images" (opcional). Ej: ["Medidor viejo dañado","Medidor nuevo instalado"]',
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description:
            'Fotos/evidencias del cambio de medidor (opcional, máx. 10)',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Method POST - Change the meter of a connection',
    description:
      'Actualiza el número de medidor de una acometida, registra el cambio en el historial de medidores y adjunta evidencias fotográficas.',
  })
  async changeMeter(
    @Req() request: Request,
    @Param('connectionId') connectionId: string,
    @Body() body: Record<string, string>,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ApiResponse> {
    try {
      if (!body.changeDetail) {
        throw new BadRequestException('changeDetail es obligatorio');
      }

      const changeDetail: MeterChangeDetail = JSON.parse(body.changeDetail);
      const descriptions: string[] = body.imageDescriptions
        ? JSON.parse(body.imageDescriptions)
        : [];

      const images = (files ?? []).map((file, index) => ({
        fileBase64: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        originalName: file.originalname,
        mimeType: file.mimetype,
        description: descriptions[index] ?? null,
      }));

      this.logger.log(
        `Received request to change meter for connection ${connectionId}`,
      );

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.change-meter',
          {
            connectionId,
            changeDetail,
            images,
          },
        ),
      );

      return new ApiResponse(
        `Meter changed successfully for connection ${connectionId}!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('get-connection/:connectionId')
  @ApiOperation({
    summary: 'Method GET - Get connection by ID',
    description: 'The endpoint allows you to retrieve a connection by its ID',
  })
  async getConnectionById(
    @Req() request: Request,
    @Param('connectionId') connectionId: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to get connection by ID: ${connectionId}`,
      );
      const response: ConnectionResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.get-connection-by-id',
          connectionId,
        ),
      );
      return new ApiResponse(
        `Connection retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('find-connections-by-sector/:sector')
  @ApiOperation({
    summary: 'Method GET - Find connections by sector',
    description: 'The endpoint allows you to find connections by their sector',
  })
  async findConnectionsBySector(
    @Req() request: Request,
    @Param('sector') sector: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to find connections by sector: ${sector} with limit=${limit} and offset=${offset}`,
      );
      const response: ConnectionResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.find-connections-by-sector',
          {
            sector,
            limit,
            offset,
          },
        ),
      );
      return new ApiResponse(
        `Connections found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('find-connections-by-client-id/:clientId')
  @ApiOperation({
    summary: 'Method GET - Find connections by client ID',
    description:
      'The endpoint allows you to find connections by their client ID',
  })
  async findConnectionsByClientId(
    @Req() request: Request,
    @Param('clientId') clientId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to find connections by client ID: ${clientId} with limit=${limit} and offset=${offset}`,
      );
      const response: ConnectionResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.find-connections-by-client-id',
          {
            clientId,
            limit,
            offset,
          },
        ),
      );
      return new ApiResponse(
        `Connections found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('get-all-connections')
  @ApiOperation({
    summary: 'Method GET - Get all connections',
    description:
      'The endpoint allows you to retrieve all connections with pagination',
  })
  async getAllConnections(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to get all connections with limit=${limit} and offset=${offset}`,
      );
      const response: ConnectionResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.get-all-connections',
          {
            limit,
            offset,
          },
        ),
      );
      return new ApiResponse(
        `Connections retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Delete('delete-connection/:connectionId')
  @ApiOperation({
    summary: 'Method DELETE - Delete a connection',
    description: 'The endpoint allows you to delete a connection by its ID',
  })
  async deleteConnection(
    @Req() request: Request,
    @Param('connectionId') connectionId: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Received request to delete connection: ${connectionId}`);
      const response: boolean = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.delete-connection',
          connectionId,
        ),
      );
      this.logger.log(
        `Connection deleted successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Connection deleted successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('verify-connection-exists/:connectionId')
  @ApiOperation({
    summary: 'Method GET - Verify if a connection exists',
    description:
      'The endpoint allows you to verify if a connection exists by its ID',
  })
  async verifyConnectionExists(
    @Req() request: Request,
    @Param('connectionId') connectionId: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to verify if connection exists: ${connectionId}`,
      );
      const response: boolean = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.verify-connection-exists',
          connectionId,
        ),
      );
      this.logger.log(
        `Connection existence verified successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Connection existence verified successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('find-connection-by-property-cadastral-key/:cadastralKey')
  @ApiOperation({
    summary: 'Method GET - Find connection and property by cadastral key',
    description:
      'The endpoint allows you to find a connection and its associated property using the property cadastral key',
  })
  async getConnectionByPropertyCadastralKey(
    @Req() request: Request,
    @Param('cadastralKey') cadastralKey: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to find connection and property by cadastral key: ${cadastralKey}`,
      );
      const response: ConnectionAndPropertyResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.find-connection-by-property-cadastral-key',
          cadastralKey,
        ),
      );
      return new ApiResponse(
        `Connection and property retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('find-connection-by-cadastral-key-or-card-id/:searchValue')
  @ApiOperation({
    summary:
      'Method GET - Find connection and property by cadastral key or card ID',
    description:
      'The endpoint allows you to find a connection and its associated property using either the cadastral key or the card ID',
  })
  async getConnectionByCadastralKeyOrCardId(
    @Req() request: Request,
    @Param('searchValue') searchValue: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to find connection and property by cadastral key or card ID: ${searchValue}`,
      );
      const response: ConnectionAndPropertyResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.find-connection-by-cadastral-key-or-card-id',
          {
            searchValue,
            limit,
            offset,
          },
        ),
      );
      return new ApiResponse(
        `Connection and property retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('find-connection-with-property-by-cadastral-key/:cadastralKey')
  @ApiOperation({
    summary: 'Method GET - Find connection with property by cadastral key',
    description:
      'The endpoint allows you to find a connection along with its associated property using the cadastral key',
  })
  async getConnectionWithPropertyByCadastralKey(
    @Req() request: Request,
    @Param('cadastralKey') cadastralKey: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to find connection with property by cadastral key: ${cadastralKey}`,
      );
      const response: ConnectionAndPropertyResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.find-connection-with-property-by-cadastral-key',
          cadastralKey,
        ),
      );
      return new ApiResponse(
        `Connection with property retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('get-all-connections-with-property')
  @ApiOperation({
    summary: 'Method GET - Get all connections with property',
    description:
      'The endpoint allows you to retrieve all connections along with their associated properties with pagination',
  })
  async getAllConnectionsWithProperty(
    @Req() request: Request,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('query') query?: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to get all connections with property with limit=${limit} and offset=${offset} and query=${query}`,
      );
      const response: ConnectionAndPropertyResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.get-all-connections-with-property',
          {
            limit,
            offset,
            query,
          },
        ),
      );
      return new ApiResponse(
        `Connections with property retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('get-connections-paginated')
  @ApiOperation({
    summary: 'Method GET - Get connections paginated with optional query',
    description:
      'The endpoint allows you to retrieve connections with pagination and an optional search query',
  })
  async getConnectionsPaginated(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('query') query?: string,
    @Query('hasIncidents') hasIncidents?: string,
    @Query('hasCoordinates') hasCoordinates?: string,
    @Query('status') status?: string,
    @Query('sewerage') sewerage?: string,
    @Query('searchField') searchField?: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to get connections paginated with limit=${limit}, offset=${offset}, query=${query}, hasIncidents=${hasIncidents}, hasCoordinates=${hasCoordinates}, status=${status}, sewerage=${sewerage}, searchField=${searchField}`,
      );
      const response: ConnectionResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.get-connections-paginated',
          {
            limit,
            offset,
            query,
            ...(hasIncidents ? { hasIncidents } : {}),
            ...(hasCoordinates ? { hasCoordinates } : {}),
            ...(status ? { status } : {}),
            ...(sewerage ? { sewerage } : {}),
            ...(searchField ? { searchField } : {}),
          },
        ),
      );
      return new ApiResponse(
        `Connections retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get(
    'find-property-with-client-by-cadastral-key-or-card-id-or-like-name/:searchValue',
  )
  @ApiOperation({
    summary:
      'Method GET - Find property with client by cadastral key, card ID or like name',
    description:
      'The endpoint allows you to find a property along with its associated client using either the cadastral key, card ID or a like name search',
  })
  async findPropertyWithClientByCadastralKeyOrCardIdOrLikeName(
    @Req() request: Request,
    @Param('searchValue') searchValue: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to find property with client by cadastral key, card ID or like name: ${searchValue} with limit=${limit} and offset=${offset}`,
      );
      const response: PropertyWithClientResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.find-property-with-client-by-cadastral-key-or-card-id-or-like-name',
          {
            searchValue,
            limit,
            offset,
          },
        ),
      );
      return new ApiResponse(
        `Property with client retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AllowedUserTypes('employee', 'customer')
  @Get('get-dashboard-connections-by-client-id/:clientId')
  @ApiOperation({
    summary: 'Method GET - Get dashboard connections by client ID',
    description:
      'The endpoint allows you to retrieve dashboard connections for a client using the client ID',
  })
  async getDashboardConnectionsByClientId(
    @Req() request: Request,
    @Param('clientId') clientId: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to get dashboard connections by client ID: ${clientId}`,
      );
      const response: ConnectionDashboardResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.get-dashboard-connections-by-client-id',
          clientId,
        ),
      );
      return new ApiResponse(
        `Dashboard connections retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AllowedUserTypes('employee', 'customer')
  @Get('get-dashboard-global-client-id/:clientId')
  @ApiOperation({
    summary: 'Method GET - Get dashboard global client ID',
    description:
      'The endpoint allows you to retrieve dashboard global information for a client using the client ID',
  })
  async getDashboardGlobalClientId(
    @Req() request: Request,
    @Param('clientId') clientId: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to get dashboard global information by client ID: ${clientId}`,
      );
      const response: ClientDashboardResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.connectionKafkaClient,
          'connections.get-dashboard-global-client-id',
          clientId,
        ),
      );
      return new ApiResponse(
        `Dashboard global information retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }
}
