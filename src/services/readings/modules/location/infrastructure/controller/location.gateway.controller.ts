import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLocationRequest } from '../../domain/schemas/dto/request/create.location.request';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { LocationResponse } from '../../domain/schemas/dto/response/location.response';

@Controller('location')
@ApiTags('Location Gateway')
//  @ApiBearerAuth()
//@UseGuards(AuthGuard)
export class LocationGatewayController implements OnModuleInit {
  private readonly logger = new Logger(LocationGatewayController.name);
  constructor(
    @Inject(environments.LOCATION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(
      'location.get-locations-by-connection-id',
    );
    this.kafkaClient.subscribeToResponseOf(
      'location.verify-location-by-connection-id',
    );
    this.kafkaClient.subscribeToResponseOf('location.create-location');
    this.kafkaClient.subscribeToResponseOf('location.get-location-by-id');
    this.logger.log('Response patterns:', this.kafkaClient['responsePatterns']);
    this.logger.log(
      'LocationGatewayController initialized and connected to Kafka',
    );
    await this.kafkaClient.connect();
  }

  @Post('create-location')
  @ApiOperation({
    summary: 'Method POST - Create a new location',
    description: 'The endpoint allows you to create a new location entry',
  })
  async createLocation(
    @Body() location: CreateLocationRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: LocationResponse = await sendKafkaRequest(
        this.kafkaClient.send('location.create-location', location),
      );
      return new ApiResponse(
        `Location created successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-locations/:connectionId')
  @ApiOperation({
    summary: 'Method GET - Get locations by connection ID',
    description:
      'The endpoint allows you to retrieve locations associated with a specific connection ID',
  })
  async getLocations(
    @Req() request: Request,
    @Param('connectionId') connectionId: string,
  ): Promise<ApiResponse> {
    try {
      const response: LocationResponse[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'location.get-locations-by-connection-id',
          connectionId,
        ),
      );
      return new ApiResponse(
        `Locations for connection ID ${connectionId} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('verify-location/:connectionId')
  @ApiOperation({
    summary: 'Method GET - Verify location existence by connection ID',
    description:
      'The endpoint allows you to verify if a location exists for a specific connection ID',
  })
  async verifyLocation(
    @Req() request: Request,
    @Param('connectionId') connectionId: string,
  ): Promise<ApiResponse> {
    try {
      const response: boolean = await sendKafkaRequest(
        this.kafkaClient.send(
          'location.verify-location-by-connection-id',
          connectionId,
        ),
      );
      return new ApiResponse(
        `Location verification for connection ID ${connectionId} completed successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-location/:locationId')
  @ApiOperation({
    summary: 'Method GET - Get location by location ID',
    description: 'The endpoint allows you to retrieve a location by its ID',
  })
  async getLocationById(
    @Req() request: Request,
    @Param('locationId', ParseIntPipe) locationId: number,
  ): Promise<ApiResponse> {
    try {
      const response: LocationResponse = await sendKafkaRequest(
        this.kafkaClient.send('location.get-location-by-id', locationId),
      );
      return new ApiResponse(
        `Location with ID ${locationId} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
