import {
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Query,
  Req
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
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
  DateRangeParams,
  FullBreakdownReport,
} from '../../../readings/domain/schemas/dto/response/entry-data.response';
import {
  GeneralCollectionsParams,
  GeneralTrendCollectionsParams,
} from '../../domain/schemas/dto/request/general-collection.params';
import {
  AgreementsCustomerParams,
  AgreementsParams,
} from '../../domain/schemas/dto/request/agreements.params';

@Controller('accounting')
@ApiTags('Accounting - Legacy')
export class AccountingLegacyGatewayController {
  private readonly logger = new Logger(AccountingLegacyGatewayController.name);
  constructor(
    @Inject('EPAA_LEGACY_ACCOUNTING_KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.find-pending-readings-by-card-id', cardId,
        ),
      );
      return new ApiResponse(
        'Pending reading by card id found successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in findPendingReadingByCardId: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.find-pending-readings-by-cadastral-key-or-card-id', searchValue,
        ),
      );
      return new ApiResponse(
        'Pending reading by cadastral key or card id found successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in findPendingReadingByCadastralKeyOrCardId: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.find-pending-readings-by-cadastral-key-or-card-id-all', searchValue,
        ),
      );
      return new ApiResponse(
        'Pending reading by cadastral key or card id found successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in findPendingReadingByCadastralKeyOrCardIdAll: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.find-payment-readings-by-payment-date', paymentDate,
        ),
      );
      return new ApiResponse(
        'Payment readings by payment date found successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in findPaymentReadingsByPaymentDate: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.find-payment-by-payment-date-and-order', params,
        ),
      );
      return new ApiResponse(
        'Payment by payment date and order value found successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in findPaymentByPaymentDateAndOrder: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.find-payment-by-init-date-and-end-date', params,
        ),
      );
      return new ApiResponse(
        'Payment by init date and end date found successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in findPaymentByInitDateAndEndDate: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-daily-grouped-report', params,
        ),
      );
      return new ApiResponse(
        'Daily grouped report retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getDailyGroupedReport: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-daily-collector-summary', params,
        ),
      );
      return new ApiResponse(
        'Daily collector summary retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getDailyCollectorSummary: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-daily-payment-method-report', params,
        ),
      );
      return new ApiResponse(
        'Daily payment method report retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getDailyPaymentMethodReport: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-full-breakdown-report', params,
        ),
      );
      return new ApiResponse(
        'Full breakdown report retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getFullBreakdownReport: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.find-all-overdue-payments', params,
        ),
      );
      return new ApiResponse(
        'All overdue payments retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in findAllOverduePayments: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.find-overdue-summary', {},
        ),
      );
      return new ApiResponse(
        'Overdue summary retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in findOverdueSummary: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.find-yearly-overdue-summary', {},
        ),
      );
      return new ApiResponse(
        'Yearly Overdue summary retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in findYearlyOverdueSummary: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.find-monthly-debt-summary', {},
        ),
      );
      return new ApiResponse(
        'Monthly Debt summary retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in findMonthlyDebtSummary: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-general-collection-kpi', params,
        ),
      );
      return new ApiResponse(
        'General Collection KPI retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getGeneralCollectionKPI: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-general-collection-report', params,
        ),
      );
      return new ApiResponse(
        'General Collection Report retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getGeneralCollectionReport: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-general-daily-collection-grouped-report', params,
        ),
      );
      return new ApiResponse(
        'General Daily Collection Grouped Report retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getGeneralDailyCollectionGroupedReport: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-general-yearly-collection-grouped-report', params,
        ),
      );
      return new ApiResponse(
        'General Yearly Collection Grouped Report retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getGeneralYearlyCollectionGroupedReport: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-general-monthly-collection-grouped-report', params,
        ),
      );
      return new ApiResponse(
        'General Monthly Collection Grouped Report retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getGeneralMonthlyCollectionGroupedReport: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-general-yearly-collection-kpi', params,
        ),
      );
      return new ApiResponse(
        'General Yearly Collection KPI retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getGeneralYearlyCollectionKPI: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-general-monthly-collection-kpi', params,
        ),
      );
      return new ApiResponse(
        'General Monthly Collection KPI retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getGeneralMonthlyCollectionKPI: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-agreements-kpi', params,
        ),
      );
      return new ApiResponse(
        'Agreements KPI retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getAgreementsKPI: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-agreements-kpi-customer/:cardId')
  @ApiOperation({
    summary: 'Method GET - Get Agreements KPI by Customer (Legacy)',
    description:
      'The endpoint allows you to get agreements KPI by customer (Legacy)',
  })
  async getAgreementsKpiCustomer(
    @Req() request: Request,
    @Param('cardId') cardId: string,
    @Query() params: AgreementsCustomerParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getAgreementsKpiCustomer request`);
      const data = { cardId, params };
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-agreements-kpi-customer', data,
        ),
      );
      return new ApiResponse(
        'Agreements KPI by customer retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getAgreementsKpiCustomer: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-agreement-installment-details/:cardId')
  @ApiOperation({
    summary: 'Method GET - Get Agreement Installment Details (Legacy)',
    description:
      'The endpoint allows you to get agreement installment details (Legacy)',
  })
  async getAgreementInstallmentDetails(
    @Req() request: Request,
    @Param('cardId') cardId: string,
    @Query() params: DateRangeParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getAgreementInstallmentDetails request`);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-agreement-installment-details', { cardId, params },
        ),
      );
      return new ApiResponse(
        'Agreement installment details retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getAgreementInstallmentDetails: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-monthly-collection-summary')
  @ApiOperation({
    summary: 'Method GET - Get Monthly Collection Summary (Legacy)',
    description:
      'The endpoint allows you to get monthly collection summary (Legacy)',
  })
  async getMonthlyCollectionSummary(
    @Req() request: Request,
    @Query('monthsBack') monthsBack: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getMonthlyCollectionSummary request`);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-monthly-collection-summary', monthsBack || 12,
        ),
      );
      return new ApiResponse(
        'Monthly collection summary retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getMonthlyCollectionSummary: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-debtors-with-risk')
  @ApiOperation({
    summary: 'Method GET - Get Debtors With Risk (Legacy)',
    description: 'The endpoint allows you to get debtors with risk (Legacy)',
  })
  async getDebtorsWithRisk(@Req() request: Request): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getDebtorsWithRisk request`);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-debtors-with-risk', {},
        ),
      );
      return new ApiResponse(
        'Debtors with risk retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getDebtorsWithRisk: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-collector-performance')
  @ApiOperation({
    summary: 'Method GET - Get Collector Performance (Legacy)',
    description:
      'The endpoint allows you to get collector performance (Legacy)',
  })
  async getCollectorPerformance(
    @Req() request: Request,
    @Query() params: DateRangeParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getCollectorPerformance request`);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-collector-performance', params,
        ),
      );
      return new ApiResponse(
        'Collector performance retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getCollectorPerformance: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-payment-method-summary')
  @ApiOperation({
    summary: 'Method GET - Get Payment Method Summary (Legacy)',
    description:
      'The endpoint allows you to get payment method summary (Legacy)',
  })
  async getPaymentMethodSummary(
    @Req() request: Request,
    @Query() params: DateRangeParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getPaymentMethodSummary request`);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-payment-method-summary', params,
        ),
      );
      return new ApiResponse(
        'Payment method summary retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getPaymentMethodSummary: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-citizen-summary')
  @ApiOperation({
    summary: 'Method GET - Get Citizen Summary (Legacy)',
    description: 'The endpoint allows you to get citizen summary (Legacy)',
  })
  async getCitizenSummary(
    @Req() request: Request,
    @Query() params: DateRangeParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getCitizenSummary request`);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 
          'epaa-legacy.accounting.get-citizen-summary', params,
        ),
      );
      return new ApiResponse(
        'Citizen summary retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getCitizenSummary: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
