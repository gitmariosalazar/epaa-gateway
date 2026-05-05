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
import { environments } from '../../../../../../settings/environments/environments';
import { TrashRateReportParams } from '../../domain/schemas/dto/request/trash-rate-report.params';
import {
  CollectorPerformanceKPIResponse,
  DailyCollectorDetailResponse,
  TrashRateAuditRowResponse,
  TrashRateKPIResponse,
} from '../../domain/schemas/dto/response/trash-rate-report.response';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';

/**
 * HTTP gateway controller for the trash-rate reporting bounded context.
 *
 * Responsibility: translate HTTP requests into Kafka messages and map
 * responses back to HTTP. No business logic lives here.
 *
 * Kafka client: TRASH_RATE_KAFKA_CLIENT (dedicated to this domain).
 * Using the domain-specific client guarantees that subscribeToResponseOf()
 * and send() operate on the same ClientKafka instance, preventing the
 * "did not subscribe to the corresponding reply topic" error.
 */
@Controller('trash-rate-report')
export class TrashRateReportGatewayController implements OnModuleInit {
  private readonly logger = new Logger(TrashRateReportGatewayController.name);

  constructor(
    @Inject(environments.TRASH_RATE_KAFKA_CLIENT)
    private readonly trashRateClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    const replyTopics: string[] = [
      'trash-rate-audit-report',
      'credit-notes',
      'missing-valor-records',
      'monthly-summary',
      'top-debtors',
      'trash-dashboard-kpi',
      'client-trash-detail',
      'trash-rate-kpi',
      'collector-performance-kpi',
      'daily-collector-detail',
    ];

    replyTopics.forEach((topic) =>
      this.trashRateClient.subscribeToResponseOf(topic),
    );

    await this.trashRateClient.connect();
    this.logger.log(
      'TrashRateReportGatewayController initialized and connected to Kafka',
    );
  }

  @Get('trash-rate-audit-report')
  async getTrashRateAuditReport(
    @Query() params: TrashRateReportParams,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getTrashRateAuditReport request: ${JSON.stringify(params)}`,
      );
      const payload = {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          // limit/offset omitted when undefined → backend falls back to 1_000_000
          limit: params.limit,
          offset: params.offset ?? 0,
          diagnosticFilter: params.diagnosticFilter ?? 'ALL',
          auditType: params.auditType ?? 'Pagados (Recaudados)',
          dateFilter: params.dateFilter ?? 'incomeDate',
        },
      };
      const response: TrashRateAuditRowResponse[] = await sendKafkaRequest(
        this.trashRateClient.send('trash-rate-audit-report', payload),
      );
      return new ApiResponse(
        `Trash rate audit report retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getTrashRateAuditReport: ${err.message}`,
        err.stack,
      );
      throw new RpcException(error as string | object);
    }
  }

  @Get('credit-notes')
  async getCreditNotes(
    @Query() params: TrashRateReportParams,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getCreditNotes request: ${JSON.stringify(params)}`,
      );
      const payload = {
        startDate: params.startDate,
        limit: params.limit ?? 100,
        offset: params.offset ?? 0,
      };
      const response: TrashRateAuditRowResponse[] = await sendKafkaRequest(
        this.trashRateClient.send('credit-notes', payload),
      );
      return new ApiResponse(
        `Credit notes retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getCreditNotes: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Get('missing-valor-records')
  async getMissingValorRecords(
    @Query() params: TrashRateReportParams,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getMissingValorRecords request: ${JSON.stringify(params)}`,
      );
      const response: TrashRateAuditRowResponse[] = await sendKafkaRequest(
        this.trashRateClient.send('missing-valor-records', params),
      );
      return new ApiResponse(
        `Missing valor records retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getMissingValorRecords: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('monthly-summary')
  async getMonthlySummary(
    @Query() params: TrashRateReportParams,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getMonthlySummary request: ${JSON.stringify(params)}`,
      );
      const response: TrashRateAuditRowResponse[] = await sendKafkaRequest(
        this.trashRateClient.send('monthly-summary', params),
      );
      return new ApiResponse(
        `Monthly summary retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getMonthlySummary: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('top-debtors')
  async getTopDebtors(
    @Query() params: TrashRateReportParams,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getTopDebtors request: ${JSON.stringify(params)}`,
      );
      const response: TrashRateAuditRowResponse[] = await sendKafkaRequest(
        this.trashRateClient.send('top-debtors', params),
      );
      return new ApiResponse(
        `Top debtors retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getTopDebtors: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Get('trash-dashboard-kpi')
  async getTrashDashboardKpi(
    @Query() params: TrashRateReportParams,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getTrashDashboardKpi request: ${JSON.stringify(params)}`,
      );
      const response: TrashRateAuditRowResponse[] = await sendKafkaRequest(
        this.trashRateClient.send('trash-dashboard-kpi', params),
      );
      return new ApiResponse(
        `Trash dashboard KPI retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getTrashDashboardKpi: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('client-trash-detail')
  async getClientTrashDetail(
    @Query('searchParams') searchParams: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getClientTrashDetail request: ${JSON.stringify(searchParams)}`,
      );
      const response: TrashRateAuditRowResponse[] = await sendKafkaRequest(
        this.trashRateClient.send('client-trash-detail', { searchParams }),
      );
      return new ApiResponse(
        `Client trash detail retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getClientTrashDetail: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('trash-rate-kpi')
  async getTrashRateKPI(
    @Query() params: TrashRateReportParams,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getTrashRateKPI request: ${JSON.stringify(params)}`,
      );
      const response: TrashRateKPIResponse[] = await sendKafkaRequest(
        this.trashRateClient.send('trash-rate-kpi', params),
      );
      return new ApiResponse(
        `Trash rate KPI retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getTrashRateKPI: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Get('collector-performance-kpi')
  async getCollectorPerformanceKPI(
    @Query() params: TrashRateReportParams,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getCollectorPerformanceKPI request: ${JSON.stringify(params)}`,
      );
      const response: CollectorPerformanceKPIResponse[] =
        await sendKafkaRequest(
          this.trashRateClient.send('collector-performance-kpi', params),
        );
      return new ApiResponse(
        `Collector performance KPI retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getCollectorPerformanceKPI: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('daily-collector-detail')
  async getDailyCollectorDetail(
    @Query() params: TrashRateReportParams,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getDailyCollectorDetail request: ${JSON.stringify(params)}`,
      );
      const response: DailyCollectorDetailResponse[] = await sendKafkaRequest(
        this.trashRateClient.send('daily-collector-detail', params),
      );
      return new ApiResponse(
        `Daily collector detail retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getDailyCollectorDetail: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
