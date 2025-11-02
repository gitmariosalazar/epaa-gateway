import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { CreateConnectionRequest } from '../../domain/schemas/dto/request/create.connection.request';

@Controller('connections')
@ApiTags('Connections Gateway')
export class ConnectionGatewayController implements OnModuleInit {
  private readonly logger: Logger = new Logger(
    ConnectionGatewayController.name,
  );

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly connectionKafkaClient: ClientKafka,
  ) { }

  onModuleInit() {
    this.logger.log('ConnectionGatewayController initialized');
    this.connectionKafkaClient.subscribeToResponseOf(
      'connections.create-connection',
    );
    this.connectionKafkaClient.subscribeToResponseOf(
      'connections.update-connection',
    );
    this.connectionKafkaClient.subscribeToResponseOf(
      'connections.get-connection-by-id',
    );
    this.connectionKafkaClient.subscribeToResponseOf(
      'connections.get-all-connections',
    );
    this.connectionKafkaClient.subscribeToResponseOf(
      'connections.delete-connection',
    );
    this.connectionKafkaClient.subscribeToResponseOf(
      'connections.verify-connection-exists',
    );
    this.connectionKafkaClient.subscribeToResponseOf(
      'connections.find-connection-by-property-cadastral-key',
    );
    this.connectionKafkaClient.subscribeToResponseOf(
      'connections.find-connection-with-property-by-cadastral-key',
    );
    this.logger.log(
      'Response patterns:',
      this.connectionKafkaClient['responsePatterns'],
    );
    this.connectionKafkaClient.connect();
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
      const response = await sendKafkaRequest(
        this.connectionKafkaClient.send(
          'connections.create-connection',
          connection,
        ),
      );
      this.logger.log(
        `Connection created successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Connection created successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
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
      const response = await sendKafkaRequest(
        this.connectionKafkaClient.send('connections.update-connection', {
          connectionId,
          connection,
        }),
      );
      this.logger.log(
        `Connection updated successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Connection updated successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
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
      const response = await sendKafkaRequest(
        this.connectionKafkaClient.send(
          'connections.get-connection-by-id',
          connectionId,
        ),
      );
      this.logger.log(
        `Connection retrieved successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Connection retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
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
      const response = await sendKafkaRequest(
        this.connectionKafkaClient.send('connections.get-all-connections', {
          limit,
          offset,
        }),
      );
      this.logger.log(
        `Connections retrieved successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Connections retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
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
      const response = await sendKafkaRequest(
        this.connectionKafkaClient.send(
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
      throw new RpcException(error);
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
      const response = await sendKafkaRequest(
        this.connectionKafkaClient.send(
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
      throw new RpcException(error);
    }
  }

  @Get('find-connection-by-property-cadastral-key/:propertyCadastralKey')
  @ApiOperation({
    summary: 'Method GET - Find connection and property by cadastral key',
    description:
      'The endpoint allows you to find a connection and its associated property using the property cadastral key',
  })
  async getConnectionByPropertyCadastralKey(
    @Req() request: Request,
    @Param('propertyCadastralKey') propertyCadastralKey: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to find connection and property by cadastral key: ${propertyCadastralKey}`,
      );
      const response = await sendKafkaRequest(
        this.connectionKafkaClient.send(
          'connections.find-connection-by-property-cadastral-key',
          propertyCadastralKey,
        ),
      );
      this.logger.log(
        `Connection and property retrieved successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Connection and property retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
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
      const response = await sendKafkaRequest(
        this.connectionKafkaClient.send(
          'connections.find-connection-with-property-by-cadastral-key',
          cadastralKey,
        ),
      );
      this.logger.log(
        `Connection with property retrieved successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Connection with property retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
