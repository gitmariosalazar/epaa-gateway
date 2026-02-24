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
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateReadingRequest } from '../../domain/schemas/dto/request/update-reading.request';
import { CreateReadingRequest } from '../../domain/schemas/dto/request/create-reading.request';
import {
  ReadingHistoryResponse,
  ReadingImagesResponse,
  ReadingResponse,
} from '../../domain/schemas/dto/response/reading.response';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { MONTHS } from '../../../../../../shared/consts/months';
import { UpdateReadingLegacyRequest } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/update.reading.request';
import { FindCurrentReadingParams } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/find-current-reading-params';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import {
  ReadingBasicInfoResponse,
  ReadingInfoResponse,
} from '../../domain/schemas/dto/response/reading-basic.response';
import { CreateReadingLegacyRequest } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/create.reading-legacy.request';

@Controller('Readings')
@ApiTags('Readings')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ReadingGatewayController implements OnModuleInit {
  private readonly logger: Logger = new Logger(ReadingGatewayController.name);
  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    @Inject(environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT)
    private readonly legacyReadingClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.readingClient.subscribeToResponseOf('reading.find-basic-reading');
    this.readingClient.subscribeToResponseOf('reading.update-current-reading');
    this.readingClient.subscribeToResponseOf('reading.create-reading');
    this.readingClient.subscribeToResponseOf('reading.find-reading-info');
    this.readingClient.subscribeToResponseOf(
      'reading.find-readings-image-by-cadastral-key',
    );
    this.readingClient.subscribeToResponseOf('reading.find-all-reading-images');

    // Subscribe to legacy topic here as well since we call it from createReading
    this.readingClient.subscribeToResponseOf(
      'epaa-legacy.reading.calculate-reading-value',
    );

    this.readingClient.subscribeToResponseOf(
      'epaa-legacy.reading.update-current-reading',
    );

    this.readingClient.subscribeToResponseOf('reading.find-reading-history');

    this.logger.log(
      'Response patterns:',
      this.readingClient['responsePatterns'],
    );
    this.logger.log('ReadingController initialized and connected to Kafka');
    await this.readingClient.connect();
  }

  @Get('find-basic-reading/:catastralCode')
  @ApiOperation({
    summary: 'Method GET - Find Basic Data for readings by catastral code',
    description: 'The endpoint allows you to search a Data Basic for readings',
  })
  async findQRCodeByAcometidaId(
    @Param('catastralCode') catastralCode: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: ReadingBasicInfoResponse[] = await sendKafkaRequest(
        this.readingClient.send('reading.find-basic-reading', catastralCode),
      );
      return new ApiResponse(
        `QR Code with acometida ID ${catastralCode} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-reading-info/:cadastralKey')
  @ApiOperation({
    summary: 'Method GET - Find Reading Info by cadastral key',
    description:
      'The endpoint allows you to search Reading Info by cadastral key',
  })
  async findReadingInfoByCadastralKey(
    @Param('cadastralKey') cadastralKey: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: ReadingInfoResponse[] = await sendKafkaRequest(
        this.readingClient.send('reading.find-reading-info', cadastralKey),
      );
      return new ApiResponse(
        `Reading info with cadastral key ${cadastralKey} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('update-current-reading/:readingId')
  @ApiOperation({
    summary: 'Method PUT - Update Current Reading by reading ID',
    description: 'The endpoint allows you to update a Current Reading',
  })
  async updateCurrentReading(
    @Param('readingId') readingId: string,
    @Body() readingRequest: UpdateReadingRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: ReadingResponse = await sendKafkaRequest(
        this.readingClient.send('reading.update-current-reading', {
          readingId,
          readingRequest,
        }),
      );

      console.log('updateCurrentReading - readingRequest', readingRequest);
      console.log(
        'updateCurrentReading - readingId',
        typeof readingRequest.readingMonth,
      );

      const updateReadingLegacyRequest: UpdateReadingLegacyRequest =
        new UpdateReadingLegacyRequest();
      updateReadingLegacyRequest.sector = response.sector!;
      updateReadingLegacyRequest.account = response.account!;
      updateReadingLegacyRequest.year = Number(
        readingRequest.readingMonth.toString().split('-')[0],
      );
      updateReadingLegacyRequest.month =
        MONTHS[readingRequest.readingMonth.toString().split('-')[1]];
      updateReadingLegacyRequest.incomeCode = response.rentalIncomeCode;
      updateReadingLegacyRequest.currentReading = response.currentReading ?? 0;
      updateReadingLegacyRequest.previousReading =
        response.previousReading ?? 0;
      updateReadingLegacyRequest.novelty = response.novelty ?? 'SIN NOVEDAD';
      updateReadingLegacyRequest.cadastralKey = response.cadastralKey ?? '';

      this.logger.log(
        `Sending updateCurrentReadingLegacy request: ${JSON.stringify(
          updateReadingLegacyRequest,
        )}`,
      );

      const findCurrentReadingParams: FindCurrentReadingParams =
        new FindCurrentReadingParams();
      findCurrentReadingParams.sector = updateReadingLegacyRequest.sector!;
      findCurrentReadingParams.account = updateReadingLegacyRequest.account!;
      findCurrentReadingParams.year = updateReadingLegacyRequest.year!;
      findCurrentReadingParams.month = updateReadingLegacyRequest.month!;
      findCurrentReadingParams.previousReading =
        updateReadingLegacyRequest.previousReading!;

      this.logger.log(
        `With findCurrentReadingParams: ${JSON.stringify(findCurrentReadingParams)}`,
      );

      await this.legacyReadingClient.emit(
        'epaa-legacy.reading.update-current-reading',
        {
          params: findCurrentReadingParams,
          request: updateReadingLegacyRequest,
        },
      );

      return new ApiResponse(
        `Current reading with reading ID ${readingId} updated successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Post('create-reading')
  @ApiOperation({
    summary: 'Method POST - Create a new Reading',
    description: 'The endpoint allows you to create a new Reading',
  })
  async createReading(
    @Body() readingRequest: CreateReadingRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      console.log('readingRequest', readingRequest);
      const params = {
        cadastralKey: readingRequest.cadastralKey,
        consumptionM3:
          readingRequest.currentReading - readingRequest.previousReading,
      };
      const readingValue: number = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.calculate-reading-value',
          params,
        ),
      );

      readingRequest.readingValue = readingValue;

      console.log('readingRequest', readingRequest);

      const response: ReadingResponse = await sendKafkaRequest<ReadingResponse>(
        this.readingClient.send('reading.create-reading', readingRequest),
      );

      if (!response) {
        throw new RpcException({
          statusCode: 500,
          message: 'Failed to create reading',
        });
      }
      /*
      const updatedReadingLegacyRequest: UpdateReadingLegacyRequest =
        new UpdateReadingLegacyRequest();
      updatedReadingLegacyRequest.sector = response.sector;
      updatedReadingLegacyRequest.account = response.account;
      updatedReadingLegacyRequest.year = response.readingDate
        ? new Date(response.readingDate).getFullYear()
        : new Date().getFullYear();
      updatedReadingLegacyRequest.month = response.readingDate
        ? MONTHS[new Date(response.readingDate).getMonth() + 1]
        : MONTHS[new Date().getMonth() + 1];
      updatedReadingLegacyRequest.incomeCode = response.rentalIncomeCode;
      updatedReadingLegacyRequest.currentReading = response.currentReading!;
      updatedReadingLegacyRequest.previousReading = response.previousReading!;
      updatedReadingLegacyRequest.novelty = response.novelty;
      updatedReadingLegacyRequest.readingDate = response.readingDate!;
      updatedReadingLegacyRequest.readingTime = response.readingTime!;
      updatedReadingLegacyRequest.cadastralKey = response.cadastralKey!;

      const findCurrentReadingParams: FindCurrentReadingParams =
        new FindCurrentReadingParams();
      findCurrentReadingParams.sector = response.sector!;
      findCurrentReadingParams.account = response.account!;
      findCurrentReadingParams.year = updatedReadingLegacyRequest.year!;
      findCurrentReadingParams.month = updatedReadingLegacyRequest.month!;
      findCurrentReadingParams.previousReading =
        updatedReadingLegacyRequest.previousReading!;

      this.logger.log(
        `Sending updateCurrentReadingLegacy request: ${JSON.stringify(updatedReadingLegacyRequest)}`,
      );

      this.logger.log(
        `With findCurrentReadingParams: ${JSON.stringify(findCurrentReadingParams)}`,
      );

      await this.legacyReadingClient.emit(
        'epaa-legacy.reading.update-current-reading',
        {
          params: findCurrentReadingParams,
          request: updatedReadingLegacyRequest,
        },
      );
      */

      const reading: CreateReadingLegacyRequest =
        new CreateReadingLegacyRequest();
      reading.previousReading = parseFloat(
        response.previousReading!.toString(),
      );
      reading.currentReading = parseFloat(response.currentReading!.toString());
      reading.cadastralKey = response.cadastralKey!;
      reading.novelty = response.novelty!;
      reading.cadastralKey = response.connectionId!;
      reading.account = parseInt(response.account!.toString());
      reading.sector = parseInt(response.sector!.toString());
      reading.rentalIncomeCode = response.rentalIncomeCode!;
      reading.readingDate = response.readingDate!;
      reading.readingTime = response.readingTime!;
      reading.year = response.readingDate
        ? new Date(response.readingDate).getFullYear()
        : new Date().getFullYear();
      reading.month = response.readingDate
        ? MONTHS[new Date(response.readingDate).getMonth() + 1]
        : MONTHS[new Date().getMonth() + 1];
      reading.readingValue = parseFloat('0');

      this.logger.log(
        `Sending createReadingLegacy request: ${JSON.stringify(reading)}`,
      );

      await this.legacyReadingClient.emit(
        'epaa-legacy.reading.create-reading-legacy',
        reading,
      );

      return new ApiResponse(
        `Reading created successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('reading-history/:cadastralKey/:limit/:offset')
  @ApiOperation({
    summary: 'Method GET - Find Reading History by cadastral key',
    description:
      'The endpoint allows you to search Reading History by cadastral key',
  })
  async findReadingHistoryByCadastralKey(
    @Param('cadastralKey') cadastralKey: string,
    @Param('limit', ParseIntPipe) limit: number,
    @Param('offset', ParseIntPipe) offset: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: ReadingHistoryResponse[] = await sendKafkaRequest(
        this.readingClient.send('reading.find-reading-history', {
          cadastralKey,
          limit,
          offset,
        }),
      );
      return new ApiResponse(
        `Reading history with cadastral key ${cadastralKey} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('readings-images/:cadastralKey')
  @ApiOperation({
    summary: 'Method GET - Find Readings Images by cadastral key',
    description:
      'The endpoint allows you to search Readings Images by cadastral key',
  })
  async findReadingsImagesByCadastralKey(
    @Param('cadastralKey') cadastralKey: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: ReadingImagesResponse[] = await sendKafkaRequest(
        this.readingClient.send(
          'reading.find-readings-image-by-cadastral-key',
          cadastralKey,
        ),
      );
      return new ApiResponse(
        `Readings images with cadastral key ${cadastralKey} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('all-readings-images')
  @ApiOperation({
    summary: 'Method GET - Find All Readings Images',
    description: 'The endpoint allows you to search All Readings Images',
  })
  async findAllReadingsImages(@Req() request: Request): Promise<ApiResponse> {
    try {
      const response: ReadingImagesResponse[] = await sendKafkaRequest(
        this.readingClient.send('reading.find-all-reading-images', {}),
      );
      return new ApiResponse(
        `All readings images found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
