import {
  Body,
  Controller,
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
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReadingLegacyRequest } from '../../domain/schemas/dto/request/create.reading-legacy.request';
import { environments } from '../../../../../../settings/environments/environments';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { FindCurrentReadingParams } from '../../domain/schemas/dto/request/find-current-reading-params';
import { UpdateReadingLegacyRequest } from '../../domain/schemas/dto/request/update.reading.request';

@Controller('readings')
@ApiTags('Readings - Legacy')
export class ReadingLegacyGatewayController implements OnModuleInit {
  private readonly logger = new Logger(ReadingLegacyGatewayController.name);
  constructor(
    @Inject(environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
  ) {}
  async onModuleInit() {
    this.readingClient.subscribeToResponseOf(
      'epaa-legacy.reading.create-reading-legacy',
    );
    this.readingClient.subscribeToResponseOf(
      'epaa-legacy.reading.find-current-reading',
    );
    this.readingClient.subscribeToResponseOf(
      'epaa-legacy.reading.update-current-reading',
    );
    this.logger.log(
      'Response patterns:',
      this.readingClient['responsePatterns'],
    );

    this.logger.log(
      'ReadingLegacyGatewayController initialized and connected to Kafka',
    );
    await this.readingClient.connect();
  }

  @Post('create-reading-legacy')
  @ApiOperation({
    summary: 'Method POST - Create Reading (Legacy)',
    description: 'The endpoint allows you to create a Reading (Legacy)',
  })
  async createReading(
    @Req() request: Request,
    @Body() reading: CreateReadingLegacyRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending createReading request: ${JSON.stringify(reading)}`,
      );
      const response = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.create-reading-legacy',
          reading,
        ),
      );
      return new ApiResponse(
        `Reading created successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in createReading: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }
  @Get('find-current-reading')
  @ApiOperation({
    summary: 'Method GET - Find Current Reading (Legacy)',
  })
  async findCurrentReading(
    @Req() request: Request,
    @Query() params: FindCurrentReadingParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending findCurrentReading request: ${JSON.stringify(params)}`,
      );

      const response = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.find-current-reading',
          params,
        ),
      );

      return new ApiResponse(
        `Current reading retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in findCurrentReading: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Put('update-current-reading')
  @ApiOperation({
    summary: 'Method PUT - Update Current Reading (Legacy)',
    description:
      'The endpoint allows you to update the current reading (Legacy)',
  })
  async updateCurrentReading(
    @Req() request: Request,
    @Query() params: FindCurrentReadingParams,
    @Body()
    readingRequest: UpdateReadingLegacyRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending updateCurrentReading request: ${JSON.stringify(readingRequest)}`,
      );
      const response = await sendKafkaRequest(
        this.readingClient.send('epaa-legacy.reading.update-current-reading', {
          params: params,
          request: readingRequest,
        }),
      );
      return new ApiResponse(
        `Current reading updated successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in updateCurrentReading: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }
}
