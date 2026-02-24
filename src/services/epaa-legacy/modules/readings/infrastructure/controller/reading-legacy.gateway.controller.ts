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
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReadingLegacyRequest } from '../../domain/schemas/dto/request/create.reading-legacy.request';
import { environments } from '../../../../../../settings/environments/environments';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { FindCurrentReadingParams } from '../../domain/schemas/dto/request/find-current-reading-params';
import { UpdateReadingLegacyRequest } from '../../domain/schemas/dto/request/update.reading.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import {
  PendingReadingResponse,
  ReadingResponse,
} from '../../domain/schemas/dto/response/readings.response';
import { CalculateReadingValueParams } from '../../domain/schemas/dto/request/calculate-reading-value-params';

@Controller('readings')
@ApiTags('Readings - Legacy')
//@ApiBearerAuth()
//@UseGuards(AuthGuard)
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
    this.readingClient.subscribeToResponseOf(
      'epaa-legacy.reading.calculate-reading-value',
    );
    this.readingClient.subscribeToResponseOf(
      'epaa-legacy.reading.find-pending-reading-by-cadastral-key',
    );
    this.readingClient.subscribeToResponseOf(
      'epaa-legacy.reading.find-pending-reading-by-card-id',
    );

      this.readingClient.subscribeToResponseOf(
      'epaa-legacy.reading.find-pending-reading-by-cadastral-key-or-card-id',
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
      const response: ReadingResponse = await sendKafkaRequest(
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

      const response: ReadingResponse = await sendKafkaRequest(
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
      const response: ReadingResponse = await sendKafkaRequest(
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

  @Get('calculate-reading-value/:cadastralKey/:consumptionM3')
  @ApiOperation({
    summary: 'Method GET - Calculate Reading Value (Legacy)',
  })
  async calculateReadingValue(
    @Req() request: Request,
    @Query() parameters: CalculateReadingValueParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending calculateReadingValue request: ${JSON.stringify(parameters)}`,
      );

      const params = {
        cadastralKey: parameters.cadastralKey,
        consumptionM3: parameters.consumptionM3,
      };

      const response: number = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.calculate-reading-value',
          params,
        ),
      );

      return new ApiResponse(
        `Reading value calculated successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in calculateReadingValue: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('find-pending-reading-by-cadastral-key/:cadastralKey')
  @ApiOperation({
    summary: 'Method GET - Find Pending Reading by Cadastral Key (Legacy)',
  })
  async findPendingReadingByCadastralKey(
    @Req() request: Request,
    @Param('cadastralKey') cadastralKey: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending findPendingReadingByCadastralKey request: ${JSON.stringify(cadastralKey)}`,
      );

      const params = {
        cadastralKey: cadastralKey,
      };

      const response: PendingReadingResponse[] = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.find-pending-reading-by-cadastral-key',
          params,
        ),
      );

      return new ApiResponse(
        `Pending reading by cadastral key found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in findPendingReadingByCadastralKey: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('find-pending-reading-by-card-id/:cardId')
  @ApiOperation({
    summary: 'Method GET - Find Pending Reading by Card ID (Legacy)',
  })
  async findPendingReadingByCardId(
    @Req() request: Request,
    @Param('cardId') cardId: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending findPendingReadingByCardId request: ${JSON.stringify(cardId)}`,
      );

      const params = {
        cardId: cardId,
      };

      const response: PendingReadingResponse[] = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.find-pending-reading-by-card-id',
          params,
        ),
      );

      return new ApiResponse(
        `Pending reading by card id found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in findPendingReadingByCardId: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('find-pending-reading-by-cadastral-key-or-card-id/:searchValue')
  @ApiOperation({
    summary: 'Method GET - Find Pending Reading by Cadastral Key or Card ID (Legacy)',
  })
  async findPendingReadingByCadastralKeyOrCardId(
    @Req() request: Request,
    @Param('searchValue') searchValue: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending findPendingReadingByCadastralKeyOrCardId request: ${JSON.stringify(searchValue)}`,
      );

      const params = {
        searchValue: searchValue,
      };

      const response: PendingReadingResponse[] = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.find-pending-reading-by-cadastral-key-or-card-id',
          params,
        ),
      );

      return new ApiResponse(
        `Pending reading by cadastral key or card id found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in findPendingReadingByCadastralKeyOrCardId: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }
}
