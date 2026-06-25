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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateReadingRequest } from '../../domain/schemas/dto/request/update-reading.request';
import { CreateReadingRequest } from '../../domain/schemas/dto/request/create-reading.request';
import {
  PendingReadingConnectionResponse,
  ReadingHistoryResponse,
  ReadingNoveltyResponse,
  ReadingResponse,
  TakenReadingConnectionResponse,
} from '../../domain/schemas/dto/response/reading.response';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { MONTHS } from '../../../../../../shared/consts/months';
import { UpdateReadingLegacyRequest } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/update.reading.request';
import { FindCurrentReadingParams } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/find-current-reading-params';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';

import {
  ReadingBasicInfoResponse,
  ReadingInfoResponse,
} from '../../domain/schemas/dto/response/reading-basic.response';
import { CreateReadingLegacyRequest } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/create.reading-legacy.request';
import { RealtimeService } from '../../../../../../shared/realtime';
import { NoveltyResponse } from '../../domain/schemas/dto/response/novelty.response';

@Controller('Readings')
@ApiTags('Readings')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ReadingGatewayController {
  private readonly logger: Logger = new Logger(ReadingGatewayController.name);

  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    @Inject(environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT)
    private readonly legacyReadingClient: ClientKafka,
    private readonly realtimeService: RealtimeService,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

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
        this.kafkaProxy.send(
          this.readingClient,
          'reading.find-basic-reading',
          catastralCode,
        ),
      );
      return new ApiResponse(
        `QR Code with acometida ID ${catastralCode} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error finding basic reading by catastral code ${catastralCode}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(
          this.readingClient,
          'reading.find-reading-info',
          cadastralKey,
        ),
      );
      return new ApiResponse(
        `Reading info with cadastral key ${cadastralKey} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error finding reading info by cadastral key ${cadastralKey}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
      const updateUserId =
        (request as any)['user']?.sub ?? (request as any)['user']?.userId;
      const response: ReadingResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.update-current-reading',
          {
            readingId,
            readingRequest,
            updateUserId,
          },
        ),
      );
      /*
      console.log('updateCurrentReading - readingRequest', readingRequest);
      console.log(
        'updateCurrentReading - readingId',
        typeof readingRequest.readingMonth,
      );
      */

      const updateReadingLegacyRequest: UpdateReadingLegacyRequest =
        new UpdateReadingLegacyRequest();
      updateReadingLegacyRequest.sector = response.sector!;
      updateReadingLegacyRequest.account = response.account!;
      updateReadingLegacyRequest.year = Number(
        readingRequest.readingMonth.toString().split('-')[0],
      );
      updateReadingLegacyRequest.month =
        MONTHS[parseInt(readingRequest.readingMonth.toString().split('-')[1])];
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

      await this.kafkaProxy.emit(
        this.legacyReadingClient,
        'epaa-legacy.reading.update-current-reading',
        {
          params: findCurrentReadingParams,
          request: updateReadingLegacyRequest,
        },
      );

      // 📡 Notificar a todos los clientes Flutter conectados por WebSocket
      this.realtimeService.notifyReadingUpdated({
        sectorId: response.sector ?? 0,
        month: readingRequest.readingMonth.toString(),
        type: 'updated',
      });

      return new ApiResponse(
        `Current reading with reading ID ${readingId} updated successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error updating current reading with reading ID ${readingId}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
      //console.log('readingRequest', readingRequest);
      const params = {
        cadastralKey: readingRequest.cadastralKey,
        consumptionM3:
          readingRequest.currentReading - readingRequest.previousReading,
      };
      /*
      const readingValue: number = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.calculate-reading-value',
          params,
        ),
      );

      readingRequest.readingValue = readingValue;

      console.log('readingRequest', readingRequest);
      */

      const creatorUserId =
        (request as any)['user']?.sub ?? (request as any)['user']?.userId;
      const response: ReadingResponse = await sendKafkaRequest<ReadingResponse>(
        this.kafkaProxy.send(this.readingClient, 'reading.create-reading', {
          ...readingRequest,
          creatorUserId,
        }),
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
      /*
      this.logger.log(
        `Sending createReadingLegacy request: ${JSON.stringify(reading)}`,
      );
      */

      await this.kafkaProxy.emit(
        this.legacyReadingClient,
        'epaa-legacy.reading.create-reading-legacy',
        reading,
      );

      // 📡 Notificar a todos los clientes Flutter conectados por WebSocket
      // Usamos el mes actual del servidor (no previousMonthReading, que es el mes anterior)
      this.realtimeService.notifyReadingUpdated({
        sectorId: response.sector ?? 0,
        month: new Date().toISOString().slice(0, 7), // 'yyyy-MM' del mes actual
        type: 'created',
      });

      return new ApiResponse(
        `Reading created successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error creating reading legacy: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(
          this.readingClient,
          'reading.find-reading-history',
          {
            cadastralKey,
            limit,
            offset,
          },
        ),
      );
      return new ApiResponse(
        `Reading history with cadastral key ${cadastralKey} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error finding reading history by cadastral key ${cadastralKey}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get([
    'get-pending-readings-by-month/:month',
    'get-pending-readings-by-month/:month/:sector',
  ])
  @ApiOperation({
    summary: 'Method GET - Get Pending Readings by month',
    description: 'The endpoint allows you to get Pending Readings by month',
  })
  @ApiParam({ name: 'sector', required: false, type: Number })
  async getPendingReadingsByMonth(
    @Req() request: Request,
    @Param('month') month: string,
    // 2. Le dices al Pipe que es opcional, y le pones el ? al tipado de TS
    @Param('sector', new ParseIntPipe({ optional: true })) sector?: number,
  ): Promise<ApiResponse> {
    try {
      const response: PendingReadingConnectionResponse[] =
        await sendKafkaRequest(
          this.kafkaProxy.send(
            this.readingClient,
            'reading.get-pending-readings-by-month',
            {
              month,
              sector, // Si no viene, pasará como undefined correctamente
            },
          ),
        );
      return new ApiResponse(
        `Pending readings with month ${month} and sector ${sector || 'ALL'} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error getting pending readings by month ${month} and sector ${sector || 'ALL'}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get([
    'get-taken-reading-estimates-or-average/:month',
    'get-taken-reading-estimates-or-average/:month/:sector',
  ])
  @ApiOperation({
    summary: 'Method GET - Get Taken Reading Estimates or Average by month',
    description:
      'The endpoint allows you to get Taken Reading Estimates or Average by month',
  })
  @ApiParam({ name: 'sector', required: false, type: Number })
  async getTakenReadingEstimatesOrAverage(
    @Param('month') month: string,
    @Req() request: Request,
    @Param('sector', new ParseIntPipe({ optional: true })) sector?: number, // <-- 2. Opcional
  ): Promise<ApiResponse> {
    try {
      const response: TakenReadingConnectionResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.get-taken-reading-estimates-or-average',
          { month, sector },
        ),
      );
      return new ApiResponse(
        `Taken reading estimates or average with month ${month} and sector ${sector || 'ALL'} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error getting taken reading estimates or average by month ${month} and sector ${sector || 'ALL'}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get([
    'get-taken-readings-by-month/:month',
    'get-taken-readings-by-month/:month/:sector',
  ])
  @ApiOperation({
    summary: 'Method GET - Get Taken Readings by month',
    description: 'The endpoint allows you to get Taken Readings by month',
  })
  @ApiParam({ name: 'sector', required: false, type: Number })
  async getTakenReadingsByMonth(
    @Param('month') month: string,
    @Req() request: Request,
    @Param('sector', new ParseIntPipe({ optional: true })) sector?: number, // <-- 2. Opcional
  ): Promise<ApiResponse> {
    try {
      const response: TakenReadingConnectionResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.get-taken-readings-by-month',
          {
            month,
            sector,
          },
        ),
      );
      return new ApiResponse(
        `Taken readings with month ${month} and sector ${sector || 'ALL'} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error getting taken readings by month ${month} and sector ${sector || 'ALL'}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  // 1. Quitar el /:novelty de la ruta
  @Get('get-reading-by-novelty/:month')
  @ApiOperation({
    summary: 'Method GET - Get Reading by novelty',
    description:
      'The endpoint allows you to get Reading by novelty. The novelty and sector are optional filters.',
  })
  @ApiParam({ name: 'month', type: String, example: '2026-05' })
  @ApiQuery({
    name: 'novelty',
    type: String,
    example: 'NORMAL',
    description: 'The novelty to filter readings by (optional)',
    required: false,
  })
  @ApiQuery({
    name: 'sector',
    required: false,
    type: Number,
    description: 'Optional sector filter',
  })
  async getReadingByNovelty(
    @Param('month') month: string,
    @Req() request: Request,
    @Query('novelty') novelty?: string,
    @Query('sector', new ParseIntPipe({ optional: true })) sector?: number,
  ): Promise<ApiResponse> {
    try {
      const response: ReadingNoveltyResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.get-reading-by-novelty',
          {
            novelty, // Si es undefined, Kafka recibirá undefined
            month,
            sector,
          },
        ),
      );

      return new ApiResponse(
        `Reading with novelty ${novelty ?? 'ALL'}, month ${month} and sector ${sector ?? 'ALL'} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error getting reading by novelty ${novelty ?? 'ALL'}, month ${month} and sector ${sector ?? 'ALL'}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err.message || err);
    }
  }

  @Get('find-all-novelties')
  @ApiOperation({
    summary: 'Method GET - Find all novelties',
    description: 'The endpoint allows you to get all novelties.',
  })
  async findAllNovelties(@Req() request: Request): Promise<ApiResponse> {
    try {
      const response: NoveltyResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.find-all-novelties',
          {},
        ),
      );
      return new ApiResponse(
        'All novelties found successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error finding all novelties: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err.message || err);
    }
  }
}
