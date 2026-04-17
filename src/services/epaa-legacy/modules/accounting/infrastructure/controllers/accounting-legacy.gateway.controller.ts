import {
  Controller,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import {
  MonthlyDebtSummaryResponse,
  OverduePaymentResponse,
  OverdueSummaryResponse,
  PaymentReadingResponse,
  PaymentResponse,
  PendingReadingResponse,
  YearlyOverdueSummaryResponse,
} from '../../../readings/domain/schemas/dto/response/readings.response';
import {
  DailyCollectorSummary,
  DailyGroupedReport,
  DailyPaymentMethodReport,
  FullBreakdownReport,
} from '../../../readings/domain/schemas/dto/response/entry-data.response';
import {
  AgreementsParams,
  GeneralCollectionsParams,
  GeneralTrendCollectionsParams,
} from '../../domain/schemas/dto/request/general-collection.params';

@Controller('accounting')
@ApiTags('Accounting - Legacy')
export class AccountingLegacyGatewayController implements OnModuleInit {
  private readonly logger = new Logger(AccountingLegacyGatewayController.name);
  constructor(
    @Inject('EPAA_LEGACY_ACCOUNTING_KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const messagePatterns: string[] = [
      'epaa-legacy.accounting.find-pending-readings-by-cadastral-key',
      'epaa-legacy.accounting.find-pending-readings-by-card-id',
      'epaa-legacy.accounting.find-pending-readings-by-cadastral-key-or-card-id',
      'epaa-legacy.accounting.find-pending-readings-by-cadastral-key-or-card-id-all',
      'epaa-legacy.accounting.find-payment-readings-by-payment-date',
      'epaa-legacy.accounting.find-payment-by-payment-date-and-order',
      'epaa-legacy.accounting.find-payment-by-init-date-and-end-date',
      'epaa-legacy.accounting.get-daily-grouped-report',
      'epaa-legacy.accounting.get-daily-collector-summary',
      'epaa-legacy.accounting.get-daily-payment-method-report',
      'epaa-legacy.accounting.get-full-breakdown-report',
      'epaa-legacy.accounting.find-all-overdue-payments',
      'epaa-legacy.accounting.find-overdue-summary',
      'epaa-legacy.accounting.find-yearly-overdue-summary',
      'epaa-legacy.accounting.find-monthly-debt-summary',
      'epaa-legacy.accounting.get-general-collection-kpi',
      'epaa-legacy.accounting.get-general-collection-report',
      'epaa-legacy.accounting.get-general-daily-collection-grouped-report',
      'epaa-legacy.accounting.get-general-yearly-collection-grouped-report',
      'epaa-legacy.accounting.get-general-monthly-collection-grouped-report',
      'epaa-legacy.accounting.get-general-yearly-collection-kpi',
      'epaa-legacy.accounting.get-general-monthly-collection-kpi',
      //AGrreements
      'epaa-legacy.accounting.get-agreements-kpi',
    ];

    messagePatterns.forEach((pattern) => {
      this.kafkaClient.subscribeToResponseOf(pattern);
    });
    await this.kafkaClient.connect();
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
        `Sending findPendingReadingByCadastralKey request: ${cadastralKey}`,
      );
      const response: PendingReadingResponse[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.find-pending-readings-by-cadastral-key',
          cadastralKey,
        ),
      );
      return new ApiResponse(
        'Pending reading by cadastral key found successfully!',
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
      this.logger.log(`Sending findPendingReadingByCardId request: ${cardId}`);
      const response: PendingReadingResponse[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.find-pending-readings-by-card-id',
          cardId,
        ),
      );
      return new ApiResponse(
        'Pending reading by card id found successfully!',
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
        `Sending findPendingReadingByCadastralKeyOrCardId request: ${searchValue}`,
      );
      const response: PendingReadingResponse[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.find-pending-readings-by-cadastral-key-or-card-id',
          searchValue,
        ),
      );
      return new ApiResponse(
        'Pending reading by cadastral key or card id found successfully!',
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
        `Sending findPendingReadingByCadastralKeyOrCardIdAll request: ${searchValue}`,
      );
      const response: PendingReadingResponse[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.find-pending-readings-by-cadastral-key-or-card-id-all',
          searchValue,
        ),
      );
      return new ApiResponse(
        'Pending reading by cadastral key or card id found successfully!',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in findPendingReadingByCadastralKeyOrCardIdAll: ${error.message}`,
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
        `Sending findPaymentReadingsByPaymentDate request: ${paymentDate}`,
      );
      const response: PaymentReadingResponse[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.find-payment-readings-by-payment-date',
          paymentDate,
        ),
      );
      return new ApiResponse(
        'Payment readings by payment date found successfully!',
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
      this.logger.log(`Sending findPaymentByPaymentDateAndOrder request`);
      const params = { paymentDate, orderValue };
      const response: PaymentResponse[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.find-payment-by-payment-date-and-order',
          params,
        ),
      );
      return new ApiResponse(
        'Payment by payment date and order value found successfully!',
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
      this.logger.log(`Sending findPaymentByInitDateAndEndDate request`);
      const params = { initDate, endDate, limit, offset };
      const response: PaymentResponse[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.find-payment-by-init-date-and-end-date',
          params,
        ),
      );
      return new ApiResponse(
        'Payment by init date and end date found successfully!',
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
      this.logger.log(`Sending getDailyGroupedReport request`);
      const params = { initDate, endDate };
      const response: DailyGroupedReport[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.get-daily-grouped-report',
          params,
        ),
      );
      return new ApiResponse(
        'Daily grouped report retrieved successfully!',
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
      this.logger.log(`Sending getDailyCollectorSummary request`);
      const params = { initDate, endDate };
      const response: DailyCollectorSummary[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.get-daily-collector-summary',
          params,
        ),
      );
      return new ApiResponse(
        'Daily collector summary retrieved successfully!',
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
      this.logger.log(`Sending getDailyPaymentMethodReport request`);
      const params = { initDate, endDate };
      const response: DailyPaymentMethodReport[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.get-daily-payment-method-report',
          params,
        ),
      );
      return new ApiResponse(
        'Daily payment method report retrieved successfully!',
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
      this.logger.log(`Sending getFullBreakdownReport request`);
      const params = { initDate, endDate };
      const response: FullBreakdownReport[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.get-full-breakdown-report',
          params,
        ),
      );
      return new ApiResponse(
        'Full breakdown report retrieved successfully!',
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
      const params = { limit, offset };
      this.logger.log(`Sending findAllOverduePayments request`);
      const response: OverduePaymentResponse[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.find-all-overdue-payments',
          params,
        ),
      );
      return new ApiResponse(
        'All overdue payments retrieved successfully!',
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

  @Get('find-overdue-summary')
  @ApiOperation({
    summary: 'Method GET - Find Overdue Summary (Legacy)',
    description: 'The endpoint allows you to find overdue summary (Legacy)',
  })
  async findOverdueSummary(@Req() request: Request): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending findOverdueSummary request`);
      const response: OverdueSummaryResponse = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.find-overdue-summary',
          {},
        ),
      );
      return new ApiResponse(
        'Overdue summary retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in findOverdueSummary: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('find-yearly-overdue-summary')
  @ApiOperation({
    summary: 'Method GET - Find Yearly Overdue Summary (Legacy)',
    description:
      'The endpoint allows you to find yearly overdue summary (Legacy)',
  })
  async findYearlyOverdueSummary(
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending findYearlyOverdueSummary request`);
      const response: YearlyOverdueSummaryResponse[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.find-yearly-overdue-summary',
          {},
        ),
      );
      return new ApiResponse(
        'Yearly Overdue summary retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in findYearlyOverdueSummary: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('find-monthly-debt-summary')
  @ApiOperation({
    summary: 'Method GET - Find Monthly Debt Summary (Legacy)',
    description:
      'The endpoint allows you to find monthly debt summary (Legacy)',
  })
  async findMonthlyDebtSummary(@Req() request: Request): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending findMonthlyDebtSummary request`);
      const response: MonthlyDebtSummaryResponse[] = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.find-monthly-debt-summary',
          {},
        ),
      );
      return new ApiResponse(
        'Monthly Debt summary retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in findMonthlyDebtSummary: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-general-collection-kpi')
  @ApiOperation({
    summary: 'Method GET - Get General Collection KPI (Legacy)',
    description:
      'The endpoint allows you to get general collection KPI (Legacy)',
  })
  async getGeneralCollectionKPI(
    @Req() request: Request,
    @Query() params: GeneralCollectionsParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getGeneralCollectionKPI request`);
      const response = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.get-general-collection-kpi',
          params,
        ),
      );
      return new ApiResponse(
        'General Collection KPI retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getGeneralCollectionKPI: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-general-collection-report')
  @ApiOperation({
    summary: 'Method GET - Get General Collection Report (Legacy)',
    description:
      'The endpoint allows you to get general collection report (Legacy)',
  })
  async getGeneralCollectionReport(
    @Req() request: Request,
    @Query() params: GeneralCollectionsParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getGeneralCollectionReport request`);
      const response = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.get-general-collection-report',
          params,
        ),
      );
      return new ApiResponse(
        'General Collection Report retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getGeneralCollectionReport: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-general-daily-collection-grouped-report')
  @ApiOperation({
    summary:
      'Method GET - Get General Daily Collection Grouped Report (Legacy)',
    description:
      'The endpoint allows you to get general daily collection grouped report (Legacy)',
  })
  async getGeneralDailyCollectionGroupedReport(
    @Req() request: Request,
    @Query() params: GeneralCollectionsParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getGeneralDailyCollectionGroupedReport request`);
      const response = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.get-general-daily-collection-grouped-report',
          params,
        ),
      );
      return new ApiResponse(
        'General Daily Collection Grouped Report retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getGeneralDailyCollectionGroupedReport: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-general-yearly-collection-grouped-report')
  @ApiOperation({
    summary:
      'Method GET - Get General Yearly Collection Grouped Report (Legacy)',
    description:
      'The endpoint allows you to get general yearly collection grouped report (Legacy)',
  })
  async getGeneralYearlyCollectionGroupedReport(
    @Req() request: Request,
    @Query() params: GeneralTrendCollectionsParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getGeneralYearlyCollectionGroupedReport request`,
      );
      const response = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.get-general-yearly-collection-grouped-report',
          params,
        ),
      );
      return new ApiResponse(
        'General Yearly Collection Grouped Report retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getGeneralYearlyCollectionGroupedReport: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-general-monthly-collection-grouped-report')
  @ApiOperation({
    summary:
      'Method GET - Get General Monthly Collection Grouped Report (Legacy)',
    description:
      'The endpoint allows you to get general monthly collection grouped report (Legacy)',
  })
  async getGeneralMonthlyCollectionGroupedReport(
    @Req() request: Request,
    @Query() params: GeneralTrendCollectionsParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getGeneralMonthlyCollectionGroupedReport request`,
      );
      const response = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.get-general-monthly-collection-grouped-report',
          params,
        ),
      );
      return new ApiResponse(
        'General Monthly Collection Grouped Report retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getGeneralMonthlyCollectionGroupedReport: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-general-yearly-collection-kpi')
  @ApiOperation({
    summary: 'Method GET - Get General Yearly Collection KPI (Legacy)',
    description:
      'The endpoint allows you to get general yearly collection KPI (Legacy)',
  })
  async getGeneralYearlyCollectionKPI(
    @Req() request: Request,
    @Query() params: GeneralTrendCollectionsParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getGeneralYearlyCollectionKPI request`);
      const response = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.get-general-yearly-collection-kpi',
          params,
        ),
      );
      return new ApiResponse(
        'General Yearly Collection KPI retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getGeneralYearlyCollectionKPI: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-general-monthly-collection-kpi')
  @ApiOperation({
    summary: 'Method GET - Get General Monthly Collection KPI (Legacy)',
    description:
      'The endpoint allows you to get general monthly collection KPI (Legacy)',
  })
  async getGeneralMonthlyCollectionKPI(
    @Req() request: Request,
    @Query() params: GeneralTrendCollectionsParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getGeneralMonthlyCollectionKPI request`);
      const response = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.get-general-monthly-collection-kpi',
          params,
        ),
      );
      return new ApiResponse(
        'General Monthly Collection KPI retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getGeneralMonthlyCollectionKPI: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-agreements-kpi')
  @ApiOperation({
    summary: 'Method GET - Get Agreements KPI (Legacy)',
    description: 'The endpoint allows you to get agreements KPI (Legacy)',
  })
  async getAgreementsKPI(
    @Req() request: Request,
    @Query() params: AgreementsParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getAgreementsKPI request`);
      const response = await sendKafkaRequest(
        this.kafkaClient.send(
          'epaa-legacy.accounting.get-agreements-kpi',
          params,
        ),
      );
      return new ApiResponse(
        'Agreements KPI retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getAgreementsKPI: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }
}
