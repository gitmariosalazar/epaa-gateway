import {
  Controller,
  Get,
  Inject,
  Logger,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import {
  ExecutiveDashboardAnalyticsResponse,
  SectorPerformanceAnalyticsResponse,
  MonthlyTrendAnalyticsResponse,
  NoveltyEconomicImpactAnalyticsResponse,
  TopConsumerAnalyticsResponse,
  InterannualComparisonAnalyticsResponse,
} from '../../domain/schemas/dto/response/reading-analytics.response';

@Controller('Readings-Analytics')
@ApiTags('Readings-Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ReadingAnalyticsGatewayController {
  private readonly logger: Logger = new Logger(
    ReadingAnalyticsGatewayController.name,
  );

  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    @Inject(environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT)
    private readonly legacyClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Get('executive-dashboard')
  @ApiOperation({
    summary: 'GET - Executive Dashboard Analytics',
    description: 'Retrieve executive KPIs for a specific billing month and optional sector filter.',
  })
  @ApiQuery({ name: 'month', required: true, example: '2026-10', description: 'Month in format YYYY-MM' })
  @ApiQuery({ name: 'sector', required: false, type: Number, description: 'Optional sector number filter' })
  async getExecutiveDashboard(
    @Req() request: Request,
    @Query('month') month: string,
    @Query('sector') sector?: string,
  ): Promise<ApiResponse> {
    try {
      const payload = {
        month: month.replace(/['"]+/g, ''),
        sector: sector ? parseInt(sector, 10) : undefined,
      };

      const response: ExecutiveDashboardAnalyticsResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.analytics.executive-dashboard',
          payload,
        ),
      );

      return new ApiResponse(
        'Executive dashboard analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving executive dashboard analytics for month ${month}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('sector-performance')
  @ApiOperation({
    summary: 'GET - Sector Performance Analytics Matrix',
    description: 'Retrieve sector revenue, volume, average consumption, ranks and share percentages.',
  })
  @ApiQuery({ name: 'month', required: true, example: '2026-10' })
  @ApiQuery({ name: 'sector', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['revenue', 'volume', 'readings', 'sector'] })
  async getSectorPerformance(
    @Req() request: Request,
    @Query('month') month: string,
    @Query('sector') sector?: string,
    @Query('sortBy') sortBy?: 'revenue' | 'volume' | 'readings' | 'sector',
  ): Promise<ApiResponse> {
    try {
      const payload = {
        month: month.replace(/['"]+/g, ''),
        sector: sector ? parseInt(sector, 10) : undefined,
        sortBy,
      };

      const response: SectorPerformanceAnalyticsResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.analytics.sector-performance',
          payload,
        ),
      );

      return new ApiResponse(
        'Sector performance analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving sector performance analytics: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('monthly-trend')
  @ApiOperation({
    summary: 'GET - Monthly Trend and MoM Growth Analytics',
    description: 'Retrieve month-over-month volume and revenue evolution across a year or date range.',
  })
  @ApiQuery({ name: 'year', required: false, type: Number, example: 2026 })
  @ApiQuery({ name: 'startMonth', required: false, example: '2026-01' })
  @ApiQuery({ name: 'endMonth', required: false, example: '2026-12' })
  @ApiQuery({ name: 'sector', required: false, type: Number })
  async getMonthlyTrend(
    @Req() request: Request,
    @Query('year') year?: string,
    @Query('startMonth') startMonth?: string,
    @Query('endMonth') endMonth?: string,
    @Query('sector') sector?: string,
  ): Promise<ApiResponse> {
    try {
      const payload = {
        year: year ? parseInt(year, 10) : undefined,
        startMonth,
        endMonth,
        sector: sector ? parseInt(sector, 10) : undefined,
      };

      const response: MonthlyTrendAnalyticsResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.analytics.monthly-trend',
          payload,
        ),
      );

      return new ApiResponse(
        'Monthly trend analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving monthly trend analytics: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('novelty-economic-impact')
  @ApiOperation({
    summary: 'GET - Novelties Classification and Economic Impact',
    description: 'Quantify operational anomalies, risk distribution and associated billing per novelty.',
  })
  @ApiQuery({ name: 'month', required: true, example: '2026-10' })
  @ApiQuery({ name: 'sector', required: false, type: Number })
  async getNoveltyEconomicImpact(
    @Req() request: Request,
    @Query('month') month: string,
    @Query('sector') sector?: string,
  ): Promise<ApiResponse> {
    try {
      const payload = {
        month: month.replace(/['"]+/g, ''),
        sector: sector ? parseInt(sector, 10) : undefined,
      };

      const response: NoveltyEconomicImpactAnalyticsResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.analytics.novelty-economic-impact',
          payload,
        ),
      );

      return new ApiResponse(
        'Novelty economic impact analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving novelty economic impact analytics: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('top-consumers')
  @ApiOperation({
    summary: 'GET - Top Consumers and High Consumption Outliers',
    description: 'Identify top consuming connections with meter number, client details and geographic location.',
  })
  @ApiQuery({ name: 'month', required: true, example: '2026-10' })
  @ApiQuery({ name: 'sector', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'minConsumptionM3', required: false, type: Number })
  @ApiQuery({ name: 'novelty', required: false, type: String })
  async getTopConsumers(
    @Req() request: Request,
    @Query('month') month: string,
    @Query('sector') sector?: string,
    @Query('limit') limit?: string,
    @Query('minConsumptionM3') minConsumptionM3?: string,
    @Query('novelty') novelty?: string,
  ): Promise<ApiResponse> {
    try {
      const payload = {
        month: month.replace(/['"]+/g, ''),
        sector: sector ? parseInt(sector, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : 50,
        minConsumptionM3: minConsumptionM3 ? parseFloat(minConsumptionM3) : undefined,
        novelty,
      };

      const response: TopConsumerAnalyticsResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.analytics.top-consumers',
          payload,
        ),
      );

      return new ApiResponse(
        'Top consumers analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving top consumers analytics: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('interannual-comparison')
  @ApiOperation({
    summary: 'GET - Interannual Paired Homologous Comparison (2025 vs 2026)',
    description: 'Compare volume and revenue between base year (legacy 2025) and target year (SIGEPAA 2026) for exact homologous accounts.',
  })
  @ApiQuery({ name: 'baseYear', required: false, type: Number, example: 2025 })
  @ApiQuery({ name: 'targetYear', required: false, type: Number, example: 2026 })
  @ApiQuery({ name: 'startMonthNumber', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'endMonthNumber', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sector', required: false, type: Number })
  @ApiQuery({ name: 'onlyHomologous', required: false, type: Boolean, example: true })
  async getInterannualComparison(
    @Req() request: Request,
    @Query('baseYear') baseYear?: string,
    @Query('targetYear') targetYear?: string,
    @Query('startMonthNumber') startMonthNumber?: string,
    @Query('endMonthNumber') endMonthNumber?: string,
    @Query('sector') sector?: string,
    @Query('onlyHomologous') onlyHomologous?: string,
  ): Promise<ApiResponse> {
    try {
      const payload = {
        baseYear: baseYear ? parseInt(baseYear, 10) : 2025,
        targetYear: targetYear ? parseInt(targetYear, 10) : 2026,
        startMonthNumber: startMonthNumber ? parseInt(startMonthNumber, 10) : 1,
        endMonthNumber: endMonthNumber ? parseInt(endMonthNumber, 10) : 10,
        sector: sector ? parseInt(sector, 10) : undefined,
        onlyHomologous: onlyHomologous !== undefined ? onlyHomologous === 'true' || onlyHomologous === '1' : true,
      };

      const response: InterannualComparisonAnalyticsResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'reading.analytics.interannual-comparison',
          payload,
        ),
      );

      return new ApiResponse(
        'Interannual comparison analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving interannual comparison analytics: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('monthly-connection-growth')
  @ApiOperation({
    summary: 'GET - Monthly Connection Growth Comparison',
    description: 'Retrieve month-by-month connection counts and net increases between base year and target year (default 2025 vs 2026), strictly joining with Datos_ingreso.',
  })
  @ApiQuery({ name: 'baseYear', required: false, type: Number, example: 2025 })
  @ApiQuery({ name: 'targetYear', required: false, type: Number, example: 2026 })
  async getMonthlyConnectionGrowth(
    @Req() request: Request,
    @Query('baseYear') baseYear?: string,
    @Query('targetYear') targetYear?: string,
  ): Promise<ApiResponse> {
    try {
      const payload = {
        baseYear: baseYear ? parseInt(baseYear, 10) : 2025,
        targetYear: targetYear ? parseInt(targetYear, 10) : 2026,
      };

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.legacyClient,
          'epaa-legacy.analytics.monthly-connection-growth',
          payload,
        ),
      );

      return new ApiResponse(
        'Monthly connection growth analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving monthly connection growth: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('annual-trend')
  @ApiOperation({
    summary: 'GET - Annual Trend Multiannual Analytics',
    description: 'Retrieve multiannual trends (volume, active connections, revenue, efficiency) across multiple years (e.g. last 5 years).',
  })
  @ApiQuery({ name: 'startYear', required: false, type: Number, example: 2022 })
  @ApiQuery({ name: 'endYear', required: false, type: Number, example: 2026 })
  @ApiQuery({ name: 'sector', required: false, type: Number })
  @ApiQuery({ name: 'limitYears', required: false, type: Number, example: 5 })
  async getAnnualTrend(
    @Req() request: Request,
    @Query('startYear') startYear?: string,
    @Query('endYear') endYear?: string,
    @Query('sector') sector?: string,
    @Query('limitYears') limitYears?: string,
  ): Promise<ApiResponse> {
    try {
      const payload = {
        startYear: startYear ? parseInt(startYear, 10) : undefined,
        endYear: endYear ? parseInt(endYear, 10) : 2026,
        sector: sector ? parseInt(sector, 10) : undefined,
        limitYears: limitYears ? parseInt(limitYears, 10) : 5,
      };

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.legacyClient,
          'epaa-legacy.analytics.annual-trend',
          payload,
        ),
      );

      return new ApiResponse(
        'Annual trend analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving annual trend: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
