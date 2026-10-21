import {
  Controller,
  Get,
  Inject,
  Logger,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { Request } from 'express';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';

const DASHBOARD_PATTERN_PREFIX = 'work-orders.dashboard';

@Controller('work-orders-dashboard')
@ApiTags('Work Orders Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class DashboardGatewayController {
  private readonly logger = new Logger(DashboardGatewayController.name);

  constructor(
    @Inject(environments.GATEWAY_WORK_ORDER_KAFKA_CLIENT)
    private readonly workOrderKafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  private async forward(
    action: string,
    payload: Record<string, string | number | undefined>,
    request: Request,
    message: string,
  ): Promise<ApiResponse> {
    try {
      const response: unknown = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          `${DASHBOARD_PATTERN_PREFIX}.${action}`,
          payload,
        ),
      );
      return new ApiResponse(message, response, request.url);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in dashboard ${action}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('funnel-summary')
  @ApiOperation({
    summary:
      'Incidents vs work orders: conversion funnel and KPI summary (1.1)',
  })
  funnelSummary(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'funnel-summary',
      {},
      request,
      'Incidents vs work orders: conversion funnel and KPI summary retrieved successfully',
    );
  }

  @Get('state-matrix')
  @ApiOperation({
    summary: 'Incident state vs work order state cross matrix (1.2)',
  })
  stateMatrix(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'state-matrix',
      {},
      request,
      'Incident state vs work order state cross matrix retrieved successfully',
    );
  }

  @Get('origin-channel')
  @ApiOperation({ summary: 'Funnel efficiency by report origin channel (1.3)' })
  originChannel(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'origin-channel',
      {},
      request,
      'Funnel efficiency by report origin channel retrieved successfully',
    );
  }

  @Get('category-department')
  @ApiOperation({
    summary: 'Incidents by category/type vs executing department (1.4)',
  })
  categoryDepartment(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'category-department',
      {},
      request,
      'Incidents by category/type vs executing department retrieved successfully',
    );
  }

  @Get('sync-discrepancies')
  @ApiOperation({
    summary: 'Incident vs work order synchronization discrepancies (1.5)',
  })
  syncDiscrepancies(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'sync-discrepancies',
      {},
      request,
      'Incident vs work order synchronization discrepancies retrieved successfully',
    );
  }

  @Get('dispatch-control')
  @ApiOperation({
    summary: 'Dispatch control list with SLA traffic light (1.6)',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  dispatchControl(
    @Req() request: Request,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<ApiResponse> {
    return this.forward(
      'dispatch-control',
      { limit },
      request,
      'Dispatch control list with SLA traffic light retrieved successfully',
    );
  }

  @Get('header-kpis')
  @ApiOperation({ summary: 'Header KPI cards for work orders (2.1)' })
  headerKpis(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'header-kpis',
      {},
      request,
      'Header KPI cards for work orders retrieved successfully',
    );
  }

  @Get('status-distribution')
  @ApiOperation({ summary: 'Work order distribution by status (2.2)' })
  statusDistribution(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'status-distribution',
      {},
      request,
      'Work order distribution by status retrieved successfully',
    );
  }

  @Get('priority-distribution')
  @ApiOperation({
    summary: 'Work order distribution by priority and SLA (2.3)',
  })
  priorityDistribution(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'priority-distribution',
      {},
      request,
      'Work order distribution by priority and SLA retrieved successfully',
    );
  }

  @Get('work-type-performance')
  @ApiOperation({
    summary: 'Performance and completion rate by work type (2.4)',
  })
  workTypePerformance(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'work-type-performance',
      {},
      request,
      'Performance and completion rate by work type retrieved successfully',
    );
  }

  @Get('key-statistics-matrix')
  @ApiOperation({
    summary: 'Department x work type x status statistics matrix (2.5)',
  })
  keyStatisticsMatrix(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'key-statistics-matrix',
      {},
      request,
      'Department x work type x status statistics matrix retrieved successfully',
    );
  }

  @Get('executive-overview')
  @ApiOperation({ summary: 'Full executive dashboard payload (7.1)' })
  executiveOverview(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'executive-overview',
      {},
      request,
      'Full executive dashboard payload retrieved successfully',
    );
  }

  @Get('technician-performance')
  @ApiOperation({ summary: 'Workload and performance by technician (3.1)' })
  technicianPerformance(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'technician-performance',
      {},
      request,
      'Workload and performance by technician retrieved successfully',
    );
  }

  @Get('technician-daily-feed')
  @ApiOperation({
    summary: 'Daily feed and priority task for technicians (3.2)',
  })
  @ApiQuery({ name: 'technicianId', required: false, type: String })
  technicianDailyFeed(
    @Req() request: Request,
    @Query('technicianId') technicianId?: string,
  ): Promise<ApiResponse> {
    return this.forward(
      'technician-daily-feed',
      { technicianId },
      request,
      'Daily feed and priority task for technicians retrieved successfully',
    );
  }

  @Get('crew-assignments')
  @ApiOperation({
    summary: 'Crew structure and roles per active work order (3.3)',
  })
  crewAssignments(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'crew-assignments',
      {},
      request,
      'Crew structure and roles per active work order retrieved successfully',
    );
  }

  @Get('sla-monitor')
  @ApiOperation({ summary: 'SLA compliance traffic-light monitor (4.1)' })
  slaMonitor(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'sla-monitor',
      {},
      request,
      'SLA compliance traffic-light monitor retrieved successfully',
    );
  }

  @Get('quality-indicators')
  @ApiOperation({ summary: 'Quality and rework indicators (4.2)' })
  qualityIndicators(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'quality-indicators',
      {},
      request,
      'Quality and rework indicators retrieved successfully',
    );
  }

  @Get('escalation-audit')
  @ApiOperation({ summary: 'Supervisor escalation audit (4.3)' })
  escalationAudit(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'escalation-audit',
      {},
      request,
      'Supervisor escalation audit retrieved successfully',
    );
  }

  @Get('material-costs')
  @ApiOperation({
    summary: 'Material cost and consumption by work type and department (5.1)',
  })
  materialCosts(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'material-costs',
      {},
      request,
      'Material cost and consumption by work type and department retrieved successfully',
    );
  }

  @Get('economic-balance')
  @ApiOperation({
    summary: 'Operational cost vs recoverable amounts per month (5.2)',
  })
  economicBalance(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'economic-balance',
      {},
      request,
      'Operational cost vs recoverable amounts per month retrieved successfully',
    );
  }

  @Get('daily-trend')
  @ApiOperation({ summary: 'Daily trend for the last 30 days (6.1)' })
  dailyTrend(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'daily-trend',
      {},
      request,
      'Daily trend for the last 30 days retrieved successfully',
    );
  }

  @Get('territorial-concentration')
  @ApiOperation({
    summary: 'Territorial concentration and geospatial analysis (6.2)',
  })
  territorialConcentration(@Req() request: Request): Promise<ApiResponse> {
    return this.forward(
      'territorial-concentration',
      {},
      request,
      'Territorial concentration and geospatial analysis retrieved successfully',
    );
  }
}
