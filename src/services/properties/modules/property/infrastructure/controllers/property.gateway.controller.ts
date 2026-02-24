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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { CreatePropertyRequest } from '../../domain/schemas/dto/request/create.property.request';
import { UpdatePropertyRequest } from '../../domain/schemas/dto/request/update.property.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

@Controller('properties')
@ApiTags('Properties Gateway')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class PropertyGatewayController implements OnModuleInit {
  private readonly logger: Logger = new Logger(PropertyGatewayController.name);

  constructor(
    @Inject(environments.PROPERTY_KAFKA_CLIENT)
    private readonly propertyKafkaClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.logger.log('PropertyGatewayController initialized');
    this.propertyKafkaClient.subscribeToResponseOf(
      'properties.create-property',
    );
    this.propertyKafkaClient.subscribeToResponseOf(
      'properties.update-property',
    );
    this.propertyKafkaClient.subscribeToResponseOf(
      'properties.get-property-by-id',
    );
    this.propertyKafkaClient.subscribeToResponseOf(
      'properties.get-all-properties',
    );
    this.propertyKafkaClient.subscribeToResponseOf(
      'properties.delete-property',
    );
    this.propertyKafkaClient.subscribeToResponseOf(
      'properties.verify-property-exists',
    );
    this.logger.log(
      'Response patterns:',
      this.propertyKafkaClient['responsePatterns'],
    );
    this.propertyKafkaClient.connect();
  }

  @Post('create-property')
  @ApiOperation({
    summary: 'Method POST - Create a new property',
    description:
      'The endpoint allows you to create a new property in the system',
  })
  async createProperty(
    @Req() request: Request,
    @Body() property: CreatePropertyRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to create property: ${JSON.stringify(property)}`,
      );
      const response = await sendKafkaRequest(
        this.propertyKafkaClient.send('properties.create-property', property),
      );
      this.logger.log(
        `Property created successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Property created successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('update-property/:propertyCadastralKey')
  @ApiOperation({
    summary: 'Method PUT - Update an existing property',
    description:
      'The endpoint allows you to update an existing property in the system',
  })
  async updateProperty(
    @Req() request: Request,
    @Param('propertyCadastralKey') propertyCadastralKey: string,
    @Body() property: UpdatePropertyRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to update property: ${JSON.stringify(property)}`,
      );
      const response = await sendKafkaRequest(
        this.propertyKafkaClient.send('properties.update-property', {
          propertyCadastralKey,
          property,
        }),
      );
      this.logger.log(
        `Property updated successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Property updated successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete('delete-property/:propertyCadastralKey')
  @ApiOperation({
    summary: 'Method DELETE - Delete an existing property',
    description:
      'The endpoint allows you to delete an existing property in the system',
  })
  async deleteProperty(
    @Req() request: Request,
    @Param('propertyCadastralKey') propertyCadastralKey: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to delete property: ${propertyCadastralKey}`,
      );
      const response = await sendKafkaRequest(
        this.propertyKafkaClient.send('properties.delete-property', {
          propertyCadastralKey,
        }),
      );
      this.logger.log(
        `Property deleted successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Property deleted successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-property/:propertyCadastralKey')
  @ApiOperation({
    summary: 'Method GET - Get property by cadastral key',
    description:
      'The endpoint allows you to retrieve a property by its cadastral key',
  })
  async getPropertyByCadastralKey(
    @Req() request: Request,
    @Param('propertyCadastralKey') propertyCadastralKey: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to get property by cadastral key: ${propertyCadastralKey}`,
      );
      const response = await sendKafkaRequest(
        this.propertyKafkaClient.send(
          'properties.get-property-by-id',
          propertyCadastralKey,
        ),
      );
      this.logger.log(
        `Property retrieved successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Property retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-all-properties')
  @ApiOperation({
    summary: 'Method GET - Get all properties',
    description:
      'The endpoint allows you to retrieve all properties with pagination',
  })
  async getAllProperties(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to get all properties with limit=${limit} and offset=${offset}`,
      );
      const response = await sendKafkaRequest(
        this.propertyKafkaClient.send('properties.get-all-properties', {
          limit,
          offset,
        }),
      );
      this.logger.log(
        `Properties retrieved successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Properties retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('verify-property-exists/:propertyCadastralKey')
  @ApiOperation({
    summary: 'Method GET - Verify if property exists by cadastral key',
    description:
      'The endpoint allows you to verify if a property exists in the system by its cadastral key',
  })
  async verifyPropertyExists(
    @Req() request: Request,
    @Param('propertyCadastralKey') propertyCadastralKey: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to verify if property exists: ${propertyCadastralKey}`,
      );
      const response = await sendKafkaRequest(
        this.propertyKafkaClient.send(
          'properties.verify-property-exists',
          propertyCadastralKey,
        ),
      );
      this.logger.log(
        `Property existence verified successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Property existence verified successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
