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

@Controller('Readings-Legacy-Analytics')
@ApiTags('Readings - Legacy Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ReadingAnalyticsLegacyGatewayController {
  private readonly logger: Logger = new Logger(
    ReadingAnalyticsLegacyGatewayController.name,
  );

  constructor(
    @Inject(environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT)
    private readonly legacyClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Get('executive-dashboard')
  @ApiOperation({
    summary: 'GET - Executive Dashboard Analytics (Legacy SQL Server)',
    description: 'Retrieve executive KPIs for SQL Server (2000/2022) with year, month and sector filtering.',
  })
  @ApiQuery({ name: 'year', required: false, type: Number, example: 2026 })
  @ApiQuery({ name: 'month', required: false, example: 'OCTUBRE', description: 'Month name (e.g. OCTUBRE) or number (1..12)' })
  @ApiQuery({ name: 'sector', required: false, type: Number, description: 'Optional sector filter' })
  async getExecutiveDashboard(
    @Req() request: Request,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('sector') sector?: string,
  ): Promise<ApiResponse> {
    try {
      const payload = {
        year: year ? parseInt(year, 10) : 2026,
        month: month ? month.replace(/['"]+/g, '') : 10,
        sector: sector ? parseInt(sector, 10) : undefined,
      };

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.legacyClient,
          'epaa-legacy.analytics.executive-dashboard',
          payload,
        ),
      );

      return new ApiResponse(
        'Legacy executive dashboard analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving legacy executive dashboard: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('sector-performance')
  @ApiOperation({
    summary: 'GET - Sector Performance Matrix (Legacy SQL Server)',
    description: 'Retrieve sector revenue, volume, average consumption, ranks and share percentages for Legacy SQL Server.',
  })
  @ApiQuery({ name: 'year', required: false, type: Number, example: 2026 })
  @ApiQuery({ name: 'month', required: false, example: 'OCTUBRE' })
  @ApiQuery({ name: 'sector', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['revenue', 'volume', 'readings', 'sector'] })
  async getSectorPerformance(
    @Req() request: Request,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('sector') sector?: string,
    @Query('sortBy') sortBy?: 'revenue' | 'volume' | 'readings' | 'sector',
  ): Promise<ApiResponse> {
    try {
      const payload = {
        year: year ? parseInt(year, 10) : 2026,
        month: month ? month.replace(/['"]+/g, '') : 10,
        sector: sector ? parseInt(sector, 10) : undefined,
        sortBy,
      };

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.legacyClient,
          'epaa-legacy.analytics.sector-performance',
          payload,
        ),
      );

      return new ApiResponse(
        'Legacy sector performance analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving legacy sector performance: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('monthly-trend')
  @ApiOperation({
    summary: 'GET - Monthly Trend Analytics (Legacy SQL Server)',
    description: 'Retrieve multimonthly volume and revenue trend for a specific year in Legacy SQL Server.',
  })
  @ApiQuery({ name: 'year', required: false, type: Number, example: 2026 })
  @ApiQuery({ name: 'startMonthNumber', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'endMonthNumber', required: false, type: Number, example: 12 })
  @ApiQuery({ name: 'sector', required: false, type: Number })
  async getMonthlyTrend(
    @Req() request: Request,
    @Query('year') year?: string,
    @Query('startMonthNumber') startMonthNumber?: string,
    @Query('endMonthNumber') endMonthNumber?: string,
    @Query('sector') sector?: string,
  ): Promise<ApiResponse> {
    try {
      const payload = {
        year: year ? parseInt(year, 10) : 2026,
        startMonthNumber: startMonthNumber ? parseInt(startMonthNumber, 10) : 1,
        endMonthNumber: endMonthNumber ? parseInt(endMonthNumber, 10) : 12,
        sector: sector ? parseInt(sector, 10) : undefined,
      };

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.legacyClient,
          'epaa-legacy.analytics.monthly-trend',
          payload,
        ),
      );

      return new ApiResponse(
        'Legacy monthly trend analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving legacy monthly trend: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('novelty-economic-impact')
  @ApiOperation({
    summary: 'GET - Novelties Economic Impact (Legacy SQL Server)',
    description: 'Quantify operational novelties distribution and associated revenue in Legacy SQL Server.',
  })
  @ApiQuery({ name: 'year', required: false, type: Number, example: 2026 })
  @ApiQuery({ name: 'month', required: false, example: 'OCTUBRE' })
  @ApiQuery({ name: 'sector', required: false, type: Number })
  async getNoveltyEconomicImpact(
    @Req() request: Request,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('sector') sector?: string,
  ): Promise<ApiResponse> {
    try {
      const payload = {
        year: year ? parseInt(year, 10) : 2026,
        month: month ? month.replace(/['"]+/g, '') : 10,
        sector: sector ? parseInt(sector, 10) : undefined,
      };

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.legacyClient,
          'epaa-legacy.analytics.novelty-economic-impact',
          payload,
        ),
      );

      return new ApiResponse(
        'Legacy novelty economic impact analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving legacy novelty impact: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('top-consumers')
  @ApiOperation({
    summary: 'GET - Top Consumers (Legacy SQL Server)',
    description: 'Retrieve top consuming connections with meter number and owner details in Legacy SQL Server.',
  })
  @ApiQuery({ name: 'year', required: false, type: Number, example: 2026 })
  @ApiQuery({ name: 'month', required: false, example: 'OCTUBRE' })
  @ApiQuery({ name: 'sector', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'minConsumptionM3', required: false, type: Number })
  @ApiQuery({ name: 'novelty', required: false, type: String })
  async getTopConsumers(
    @Req() request: Request,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('sector') sector?: string,
    @Query('limit') limit?: string,
    @Query('minConsumptionM3') minConsumptionM3?: string,
    @Query('novelty') novelty?: string,
  ): Promise<ApiResponse> {
    try {
      const payload = {
        year: year ? parseInt(year, 10) : 2026,
        month: month ? month.replace(/['"]+/g, '') : 10,
        sector: sector ? parseInt(sector, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : 50,
        minConsumptionM3: minConsumptionM3 ? parseFloat(minConsumptionM3) : undefined,
        novelty,
      };

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.legacyClient,
          'epaa-legacy.analytics.top-consumers',
          payload,
        ),
      );

      return new ApiResponse(
        'Legacy top consumers analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving legacy top consumers: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('interannual-comparison')
  @ApiOperation({
    summary: 'GET - Interannual Comparison 2025 vs 2026 (Legacy SQL Server)',
    description: 'Perform interannual comparison directly inside SQL Server between 2025 (Legacy original) and 2026 (synchronized).',
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

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.legacyClient,
          'epaa-legacy.analytics.interannual-comparison',
          payload,
        ),
      );

      return new ApiResponse(
        'Legacy interannual comparison analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving legacy interannual comparison: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('monthly-connection-growth')
  @ApiOperation({
    summary: 'GET - Monthly Connection Growth Comparison (Legacy SQL Server)',
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
        'Legacy monthly connection growth analytics retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving legacy monthly connection growth: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
