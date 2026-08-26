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
  UseInterceptors,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
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
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';

import {
  ReadingBasicInfoResponse,
  ReadingDetailedResponse,
  ReadingInfoResponse,
} from '../../domain/schemas/dto/response/reading-basic.response';
import { NoveltyResponse } from '../../domain/schemas/dto/response/novelty.response';
import { RequireAppKey } from '../../../../../../auth/decorator/require-app-key.decorator';
import { CreateReadingUseCase } from '../../application/use-cases/create-reading.use-case';
import { UpdateCurrentReadingUseCase } from '../../application/use-cases/update-current-reading.use-case';
import { AccessTokenPayload } from '../../../../../../shared/utils/interfaces/user.payload';

@Controller('Readings')
@ApiTags('Readings')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ReadingGatewayController {
  private readonly logger: Logger = new Logger(ReadingGatewayController.name);

  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
    private readonly createReadingUseCase: CreateReadingUseCase,
    private readonly updateCurrentReadingUseCase: UpdateCurrentReadingUseCase,
  ) {}

  /** Extracts the authenticated user id set by AuthGuard onto the request. */
  private extractUserId(request: Request): string | undefined {
    const user: AccessTokenPayload = (request as any)[
      'user'
    ] as AccessTokenPayload;
    return user?.sub;
  }

  /** Extracts the username claim from the JWT payload (not the user id). */
  private extractUsername(request: Request): { username: string } {
    const user: AccessTokenPayload = (request as any)[
      'user'
    ] as AccessTokenPayload;
    return { username: user.username };
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

  @RequireAppKey()
  @ApiSecurity('x-api-key')
  @ApiConsumes('multipart/form-data')
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
      const updateUserId = this.extractUserId(request);
      const { username } = this.extractUsername(request);
      const response = await this.updateCurrentReadingUseCase.execute(
        readingId,
        readingRequest,
        updateUserId,
        username,
      );

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
      const creatorUserId = this.extractUserId(request);
      const { username } = this.extractUsername(request);
      const response = await this.createReadingUseCase.execute(
        readingRequest,
        creatorUserId,
        username,
      );

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
    @Query('userId') userId?: string, // <-- changed to query
  ): Promise<ApiResponse> {
    try {
      const response: TakenReadingConnectionResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.get-taken-reading-estimates-or-average',
          { month, sector, userId },
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
    @Query('userId') userId?: string, // <-- changed to query
  ): Promise<ApiResponse> {
    try {
      const response: TakenReadingConnectionResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.get-taken-readings-by-month',
          {
            month,
            sector,
            userId,
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
    @Query('userId') userId?: string,
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
            userId,
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('get-map-geojson-by-day-and-by-user/:date')
  @ApiOperation({
    summary: 'Method GET - Get Map GeoJSON by day and by user',
    description:
      'The endpoint allows you to get Map GeoJSON data for readings on a specific day, optionally filtered by user ID.',
  })
  @ApiParam({ name: 'date', type: String, example: '2026-08-18' })
  @ApiQuery({
    name: 'userId',
    type: String,
    required: false,
    description: 'Optional user ID filter',
  })
  async getMapGeojsonByDayAndByUser(
    @Req() request: Request,
    @Param('date') date: string,
    @Query('userId') userId?: string,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.get-map-geojson-by-day-and-by-user',
          { date, userId },
        ),
      );
      return new ApiResponse(
        `Map GeoJSON data for date ${date} and user ID ${userId ?? 'ALL'} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error getting Map GeoJSON by day ${date} and user ID ${userId ?? 'ALL'}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err.message || err);
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('get-detailed-reading-info-by-cadastral-key/:cadastralKey/:yearAndMonth')
  @ApiOperation({
    summary:
      'Method GET - Get Detailed Reading Info by cadastral key and year/month',
    description:
      'The endpoint allows you to get detailed reading information for a specific cadastral key and year/month.',
  })
  @ApiParam({ name: 'cadastralKey', type: String, example: '14-293' })
  @ApiParam({ name: 'yearAndMonth', type: String, example: '2026-08' })
  async getDetailedReadingInfoByCadastralKey(
    @Req() request: Request,
    @Param('cadastralKey') cadastralKey: string,
    @Param('yearAndMonth') yearAndMonth: string,
  ): Promise<ApiResponse> {
    try {
      const response: ReadingDetailedResponse | null = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.get-detailed-reading-info-by-cadastral-key',
          { cadastralKey, yearAndMonth },
        ),
      );
      return new ApiResponse(
        `Detailed reading info for cadastral key ${cadastralKey} and year/month ${yearAndMonth} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error getting detailed reading info by cadastral key ${cadastralKey} and year/month ${yearAndMonth}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err.message || err);
    }
  }
}
