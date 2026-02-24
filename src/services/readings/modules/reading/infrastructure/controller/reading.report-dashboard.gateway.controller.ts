import {
  Controller,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import {
  AdvancedReportReadingsResponse,
  ConnectionLastReadingsReport,
  DailyReadingsReport,
  DailyStatsReport,
  DashboardMetrics,
  GlobalStatsReport,
  NoveltyStatsReport,
  SectorStatsReport,
  YearlyReadingsReport,
} from '../../domain/schemas/dto/response/report-dashboard.response';

@Controller('Readings-Report-Dashboard')
@ApiTags('Readings-Report-Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ReadingReportDashboardGatewayController implements OnModuleInit {
  private readonly logger: Logger = new Logger(
    ReadingReportDashboardGatewayController.name,
  );
  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.readingClient.subscribeToResponseOf('reading.dashboard.metrics');
    this.readingClient.subscribeToResponseOf('reading.report.yearly');
    this.readingClient.subscribeToResponseOf('reading.report.daily');
    this.readingClient.subscribeToResponseOf(
      'reading.report.connection.last-10',
    );
    this.readingClient.subscribeToResponseOf('reading.report.stats.global');
    this.readingClient.subscribeToResponseOf('reading.report.stats.daily');
    this.readingClient.subscribeToResponseOf('reading.report.stats.sector');
    this.readingClient.subscribeToResponseOf('reading.report.stats.novelty');
    this.readingClient.subscribeToResponseOf('reading.report.advanced-monthly');

    this.logger.log(
      'Response patterns:',
      this.readingClient['responsePatterns'],
    );
    this.logger.log('ReadingController initialized and connected to Kafka');
    await this.readingClient.connect();
  }

  @Get('report/dashboard')
  @ApiOperation({
    summary: 'Method GET - Find Dashboard Metrics',
    description: 'The endpoint allows you to search Dashboard Metrics',
  })
  async findDashboardMetrics(
    @Req() request: Request,
    @Query('date') date: string,
  ): Promise<ApiResponse> {
    try {
      const response: DashboardMetrics = await sendKafkaRequest(
        this.readingClient.send('reading.dashboard.metrics', date),
      );
      return new ApiResponse(
        `Dashboard metrics found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('report/daily/:date')
  @ApiOperation({
    summary: 'Method GET - Find Daily Readings Report',
    description: 'The endpoint allows you to search Daily Readings Report',
  })
  async findDailyReadingsReport(
    @Req() request: Request,
    @Param('date') date: string,
  ): Promise<ApiResponse> {
    try {
      console.log(`date`, date);
      const response: DailyReadingsReport[] = await sendKafkaRequest(
        this.readingClient.send('reading.report.daily', date),
      );
      return new ApiResponse(
        `Daily readings report found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('report/yearly/:year')
  @ApiOperation({
    summary: 'Method GET - Find Yearly Readings Report',
    description: 'The endpoint allows you to search Yearly Readings Report',
  })
  async findYearlyReadingsReport(
    @Req() request: Request,
    @Param('year', ParseIntPipe) year: number,
  ): Promise<ApiResponse> {
    try {
      const response: YearlyReadingsReport[] = await sendKafkaRequest(
        this.readingClient.send('reading.report.yearly', year),
      );
      return new ApiResponse(
        `Yearly readings report found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('report/connection-last-readings-10/:cadastralKey')
  @ApiOperation({
    summary: 'Method GET - Find Connection Last Readings Report',
    description:
      'The endpoint allows you to search Connection Last Readings Report',
  })
  async findConnectionLastReadingsReport(
    @Req() request: Request,
    @Param('cadastralKey') cadastralKey: string,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<ApiResponse> {
    try {
      const response: ConnectionLastReadingsReport[] = await sendKafkaRequest(
        this.readingClient.send('reading.report.connection.last-10', {
          cadastralKey,
          limit,
        }),
      );
      return new ApiResponse(
        `Connection last readings report found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('report/stats/global/:month')
  @ApiOperation({
    summary: 'Method GET - Find Global Stats Report',
    description: 'The endpoint allows you to search Global Stats Report',
  })
  async findGlobalStatsReport(
    @Req() request: Request,
    @Param('month') month: string,
  ): Promise<ApiResponse> {
    try {
      const response: GlobalStatsReport[] = await sendKafkaRequest(
        this.readingClient.send('reading.report.stats.global', month),
      );
      return new ApiResponse(
        `Global stats report found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('report/stats/daily/:month')
  @ApiOperation({
    summary: 'Method GET - Find Daily Stats Report',
    description: 'The endpoint allows you to search Daily Stats Report',
  })
  async findDailyStatsReport(
    @Req() request: Request,
    @Param('month') month: string,
  ): Promise<ApiResponse> {
    try {
      const response: DailyStatsReport[] = await sendKafkaRequest(
        this.readingClient.send('reading.report.stats.daily', month),
      );
      return new ApiResponse(
        `Daily stats report found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('report/stats/sector/:month')
  @ApiOperation({
    summary: 'Method GET - Find Sector Stats Report',
    description: 'The endpoint allows you to search Sector Stats Report',
  })
  async findSectorStatsReport(
    @Req() request: Request,
    @Param('month') month: string,
  ): Promise<ApiResponse> {
    try {
      const response: SectorStatsReport[] = await sendKafkaRequest(
        this.readingClient.send('reading.report.stats.sector', month),
      );
      return new ApiResponse(
        `Sector stats report found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('report/stats/novelty/:month')
  @ApiOperation({
    summary: 'Method GET - Find Novelty Stats Report',
    description: 'The endpoint allows you to search Novelty Stats Report',
  })
  async findNoveltyStatsReport(
    @Req() request: Request,
    @Param('month') month: string,
  ): Promise<ApiResponse> {
    try {
      const response: NoveltyStatsReport[] = await sendKafkaRequest(
        this.readingClient.send('reading.report.stats.novelty', month),
      );
      return new ApiResponse(
        `Novelty stats report found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('report/advanced-monthly/:month')
  @ApiOperation({
    summary: 'Method GET - Find Advanced Report Readings',
    description: 'The endpoint allows you to search Advanced Report Readings',
  })
  async findAdvancedReportReadings(
    @Req() request: Request,
    @Param('month') month: string,
  ): Promise<ApiResponse> {
    try {
      const response: AdvancedReportReadingsResponse[] = await sendKafkaRequest(
        this.readingClient.send('reading.report.advanced-monthly', month),
      );
      return new ApiResponse(
        `Advanced report readings found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
