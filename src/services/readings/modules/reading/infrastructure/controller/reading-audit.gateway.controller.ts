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
  AuditSectorHistoryResponse,
  AuditSectorResponse,
  CloseAuditSectorResponse,
  InitializeAuditResponse,
} from '../../domain/schemas/dto/response/audit-sector.response';
import { RealtimeService } from '../../../../../../shared/realtime';

@Controller('readings/audit')
@ApiTags('Readings — Audit')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ReadingAuditGatewayController implements OnModuleInit {
  private readonly logger: Logger = new Logger(
    ReadingAuditGatewayController.name,
  );

  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    private readonly realtimeService: RealtimeService,
  ) {}

  async onModuleInit() {
    this.readingClient.subscribeToResponseOf(
      'reading.audit.initialize-monthly',
    );
    this.readingClient.subscribeToResponseOf('reading.audit.by-month');
    this.readingClient.subscribeToResponseOf(
      'reading.audit.by-sector-and-month',
    );
    this.readingClient.subscribeToResponseOf('reading.audit.close-sector');
    this.readingClient.subscribeToResponseOf('reading.audit.history-by-sector');
    this.logger.log('ReadingAuditGatewayController initialized');
  }

  // ── Initialize Monthly Audit ───────────────────────────────────────────────

  @Post('initialize/:month')
  @ApiOperation({
    summary: 'Method POST - Initialize monthly audit',
    description:
      'Triggers pr_generar_auditoria_mensual() to create reading targets for all sectors in the given month, based on connections with permite_lectura = TRUE.',
  })
  async initializeMonthlyAudit(
    @Req() request: Request,
    @Param('month') month: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Initializing monthly audit for period: ${month}`);
      const response: InitializeAuditResponse = await sendKafkaRequest(
        this.readingClient.send('reading.audit.initialize-monthly', month),
      );
      return new ApiResponse(
        `Monthly audit initialized: ${response.sectorsGenerated} sectors created for ${response.period}`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error initializing monthly audit for period ${month}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  // ── Get Audit by Month ─────────────────────────────────────────────────────

  @Get('by-month/:month')
  @ApiOperation({
    summary: 'Method GET - Get audit status for all sectors in a month',
    description:
      'Returns the reading audit progress for all sectors in the given month: expected vs completed, % advance, and closure status.',
  })
  async getAuditByMonth(
    @Req() request: Request,
    @Param('month') month: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Fetching audit for month: ${month}`);
      const response: AuditSectorResponse[] = await sendKafkaRequest(
        this.readingClient.send('reading.audit.by-month', month),
      );
      return new ApiResponse(
        `Audit for month ${month} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error fetching audit for month ${month}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  // ── Get Audit by Sector and Month ─────────────────────────────────────────

  @Get('by-sector/:sector/:month')
  @ApiOperation({
    summary: 'Method GET - Get audit detail for a specific sector and month',
    description:
      'Returns the reading audit detail for a single sector in the given month. Used by zone supervisors to monitor their area.',
  })
  async getAuditBySectorAndMonth(
    @Req() request: Request,
    @Param('sector', ParseIntPipe) sector: number,
    @Param('month') month: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Fetching audit for sector ${sector}, month: ${month}`);
      const response: AuditSectorResponse | null = await sendKafkaRequest(
        this.readingClient.send('reading.audit.by-sector-and-month', {
          sector,
          month,
        }),
      );
      return new ApiResponse(
        `Audit for sector ${sector} / ${month} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error fetching audit for sector ${sector} / ${month}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  // ── Close Audit Sector ────────────────────────────────────────────────────

  @Post('close/:sector/:month')
  @ApiOperation({
    summary: 'Method POST - Supervised closure of a sector audit',
    description:
      'Manually closes the audit for a sector with supervisor accountability. Once closed by a supervisor, the record cannot be auto-reopened by the system.',
  })
  async closeAuditSector(
    @Req() request: Request,
    @Param('sector', ParseIntPipe) sector: number,
    @Param('month') month: string,
    @Body() body: { supervisorId: string; observaciones?: string },
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Closing audit for sector ${sector}, month ${month} by supervisor ${body.supervisorId}`,
      );
      const response: CloseAuditSectorResponse = await sendKafkaRequest(
        this.readingClient.send('reading.audit.close-sector', {
          sector,
          month,
          supervisorId: body.supervisorId,
          observaciones: body.observaciones,
        }),
      );
      // 📡 Notificar a todos los clientes Flutter conectados por WebSocket
      this.realtimeService.notifyAuditUpdated({
        sectorId: sector,
        month,
        type: 'closed',
      });

      return new ApiResponse(
        `Audit for sector ${sector} / ${month} closed successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error closing audit for sector ${sector} / ${month}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  // ── Audit History by Sector ────────────────────────────────────────────────

  @Get('history/:sector')
  @ApiOperation({
    summary: 'Method GET - Audit history for a sector (last N months)',
    description:
      'Returns the historical audit progress for a sector over the last N months (default: 12). Ideal for trend charts and zone performance analysis.',
  })
  async getAuditHistoryBySector(
    @Req() request: Request,
    @Param('sector', ParseIntPipe) sector: number,
    @Query('months') months?: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Fetching audit history for sector ${sector}, last ${months ?? 12} months`,
      );
      const response: AuditSectorHistoryResponse[] = await sendKafkaRequest(
        this.readingClient.send('reading.audit.history-by-sector', {
          sector,
          months: months ? Number(months) : 12,
        }),
      );
      return new ApiResponse(
        `Audit history for sector ${sector} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error fetching audit history for sector ${sector}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
