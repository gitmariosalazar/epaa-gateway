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
  OverduePaymentResponse,
  PaymentReadingResponse,
  PaymentResponse,
  PendingReadingResponse,
  ReadingResponse,
} from '../../domain/schemas/dto/response/readings.response';
import { CalculateReadingValueParams } from '../../domain/schemas/dto/request/calculate-reading-value-params';
import {
  DailyCollectorSummary,
  DailyGroupedReport,
  DailyPaymentMethodReport,
  FullBreakdownReport,
} from '../../domain/schemas/dto/response/entry-data.response';

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
    const messagePatterns: string[] = [
      'epaa-legacy.reading.create-reading-legacy',
      'epaa-legacy.reading.find-current-reading',
      'epaa-legacy.reading.update-current-reading',
      'epaa-legacy.reading.calculate-reading-value',
      'epaa-legacy.reading.find-pending-reading-by-cadastral-key',
      'epaa-legacy.reading.find-pending-reading-by-card-id',
      'epaa-legacy.reading.find-pending-reading-by-cadastral-key-or-card-id',
      'epaa-legacy.reading.find-payment-readings-by-payment-date',
      'epaa-legacy.reading.find-payment-by-payment-date-and-order',
      'epaa-legacy.reading.find-payment-by-init-date-and-end-date',
      'epaa-legacy.reading.get-daily-grouped-report',
      'epaa-legacy.reading.get-daily-collector-summary',
      'epaa-legacy.reading.get-daily-payment-method-report',
      'epaa-legacy.reading.get-full-breakdown-report',
      'epaa-legacy.reading.find-all-overdue-payments',
      'epaa-legacy.reading.find-pending-reading-by-cadastral-key-or-card-id-all',
    ];

    messagePatterns.forEach((pattern) => {
      this.readingClient.subscribeToResponseOf(pattern);
    });
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
    description: 'The endpoint allows you to find the current reading (Legacy)',
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
    description:
      'The endpoint allows you to calculate the reading value (Legacy)',
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
    description:
      'The endpoint allows you to find pending readings by cadastral key (Legacy)',
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
    description:
      'The endpoint allows you to find pending readings by card id (Legacy)',
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
    summary:
      'Method GET - Find Pending Reading by Cadastral Key or Card ID (Legacy)',
    description:
      'The endpoint allows you to find pending readings by cadastral key or card id (Legacy)',
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

  @Get('find-pending-reading-by-cadastral-key-or-card-id-all/:searchValue')
  @ApiOperation({
    summary:
      'Method GET - Find Pending Reading by Cadastral Key or Card ID (Legacy) - All',
    description:
      'The endpoint allows you to find pending readings by cadastral key or card id (Legacy) - All',
  })
  async findPendingReadingByCadastralKeyOrCardIdAll(
    @Req() request: Request,
    @Param('searchValue') searchValue: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending findPendingReadingByCadastralKeyOrCardIdAll request: ${JSON.stringify(searchValue)}`,
      );

      const params = {
        searchValue: searchValue,
      };

      const response: PendingReadingResponse[] = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.find-pending-reading-by-cadastral-key-or-card-id-all',
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

  @Get('find-payment-readings-by-payment-date/:paymentDate')
  @ApiOperation({
    summary: 'Method GET - Find Payment Readings by Payment Date (Legacy)',
    description:
      'The endpoint allows you to find payment readings by payment date (Legacy)',
  })
  async findPaymentReadingsByPaymentDate(
    @Req() request: Request,
    @Param('paymentDate') paymentDate: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending findPaymentReadingsByPaymentDate request: ${JSON.stringify(paymentDate)}`,
      );

      const response: PaymentReadingResponse[] = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.find-payment-readings-by-payment-date',
          paymentDate,
        ),
      );

      return new ApiResponse(
        `Payment readings by payment date found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in findPaymentReadingsByPaymentDate: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('find-payment-by-payment-date-and-order/:paymentDate/:orderValue')
  @ApiOperation({
    summary:
      'Method GET - Find Payment by Payment Date and Order Value (Legacy)',
    description:
      'The endpoint allows you to find payments by payment date and order value (Legacy)',
  })
  async findPaymentByPaymentDateAndOrder(
    @Req() request: Request,
    @Param('paymentDate') paymentDate: string,
    @Param('orderValue') orderValue: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending findPaymentByPaymentDateAndOrder request: ${JSON.stringify({ paymentDate, orderValue })}`,
      );

      const params = {
        paymentDate: paymentDate,
        orderValue: orderValue,
      };

      const response: PaymentResponse[] = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.find-payment-by-payment-date-and-order',
          params,
        ),
      );

      return new ApiResponse(
        `Payment by payment date and order value found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in findPaymentByPaymentDateAndOrder: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get(
    'find-payment-by-init-date-and-end-date/:initDate/:endDate/:limit/:offset',
  )
  @ApiOperation({
    summary: 'Method GET - Find Payment by Init Date and End Date (Legacy)',
    description:
      'The endpoint allows you to find payments by init date and end date (Legacy)',
  })
  async findPaymentByInitDateAndEndDate(
    @Req() request: Request,
    @Param('initDate') initDate: string,
    @Param('endDate') endDate: string,
    @Param('limit') limit: number,
    @Param('offset') offset: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending findPaymentByInitDateAndEndDate request: ${JSON.stringify({ initDate, endDate, limit, offset })}`,
      );

      const params = {
        initDate: initDate,
        endDate: endDate,
        limit: limit,
        offset: offset,
      };

      const response: PaymentResponse[] = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.find-payment-by-init-date-and-end-date',
          params,
        ),
      );

      return new ApiResponse(
        `Payment by init date and end date found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in findPaymentByInitDateAndEndDate: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-daily-grouped-report/:initDate/:endDate')
  @ApiOperation({
    summary: 'Method GET - Get Daily Grouped Report (Legacy)',
    description: 'The endpoint allows you to get daily grouped report (Legacy)',
  })
  async getDailyGroupedReport(
    @Req() request: Request,
    @Param('initDate') initDate: string,
    @Param('endDate') endDate: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getDailyGroupedReport request: ${JSON.stringify({ initDate, endDate })}`,
      );

      const params = {
        initDate: initDate,
        endDate: endDate,
      };

      const response: DailyGroupedReport[] = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.get-daily-grouped-report',
          params,
        ),
      );

      return new ApiResponse(
        `Daily grouped report retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getDailyGroupedReport: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-daily-collector-summary/:initDate/:endDate')
  @ApiOperation({
    summary: 'Method GET - Get Daily Collector Summary (Legacy)',
    description:
      'The endpoint allows you to get daily collector summary (Legacy)',
  })
  async getDailyCollectorSummary(
    @Req() request: Request,
    @Param('initDate') initDate: string,
    @Param('endDate') endDate: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getDailyCollectorSummary request: ${JSON.stringify({ initDate, endDate })}`,
      );

      const params = {
        initDate: initDate,
        endDate: endDate,
      };

      const response: DailyCollectorSummary[] = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.get-daily-collector-summary',
          params,
        ),
      );

      return new ApiResponse(
        `Daily collector summary retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getDailyCollectorSummary: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-daily-payment-method-report/:initDate/:endDate')
  @ApiOperation({
    summary: 'Method GET - Get Daily Payment Method Report (Legacy)',
    description:
      'The endpoint allows you to get daily payment method report (Legacy)',
  })
  async getDailyPaymentMethodReport(
    @Req() request: Request,
    @Param('initDate') initDate: string,
    @Param('endDate') endDate: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getDailyPaymentMethodReport request: ${JSON.stringify({ initDate, endDate })}`,
      );

      const params = {
        initDate: initDate,
        endDate: endDate,
      };

      const response: DailyPaymentMethodReport[] = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.get-daily-payment-method-report',
          params,
        ),
      );

      return new ApiResponse(
        `Daily payment method report retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getDailyPaymentMethodReport: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-full-breakdown-report/:initDate/:endDate')
  @ApiOperation({
    summary: 'Method GET - Get Full Breakdown Report (Legacy)',
    description:
      'The endpoint allows you to get full breakdown report (Legacy)',
  })
  async getFullBreakdownReport(
    @Req() request: Request,
    @Param('initDate') initDate: string,
    @Param('endDate') endDate: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getFullBreakdownReport request: ${JSON.stringify({ initDate, endDate })}`,
      );

      const params = {
        initDate: initDate,
        endDate: endDate,
      };

      const response: FullBreakdownReport[] = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.get-full-breakdown-report',
          params,
        ),
      );

      return new ApiResponse(
        `Full breakdown report retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getFullBreakdownReport: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('find-all-overdue-payments/:limit/:offset')
  @ApiOperation({
    summary: 'Method GET - Find All Overdue Payments (Legacy)',
    description:
      'The endpoint allows you to find all overdue payments (Legacy)',
  })
  async findAllOverduePayments(
    @Req() request: Request,
    @Param('limit') limit: number,
    @Param('offset') offset: number,
  ): Promise<ApiResponse> {
    try {
      const params = {
        limit: limit,
        offset: offset,
      };
      this.logger.log(
        `Sending findAllOverduePayments request: ${JSON.stringify(params)}`,
      );

      const response: OverduePaymentResponse[] = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.find-all-overdue-payments',
          params,
        ),
      );

      return new ApiResponse(
        `All overdue payments retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in findAllOverduePayments: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }
}
