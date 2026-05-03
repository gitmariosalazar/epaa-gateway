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
  BulkStateChangeResponse,
  ConnectionsByStateResponse,
  ConnectionStateHistoryResponse,
  ConnectionStateResponse,
  StateSummaryResponse,
} from '../../domain/schemas/dto/response/connection-state.response';
import {
  BulkChangeConnectionStateRequest,
  ChangeConnectionStateRequest,
} from '../../domain/schemas/dto/request/change-state.connection.request';

@Controller('connections/state')
@ApiTags('Connections — State Management')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ConnectionStateGatewayController implements OnModuleInit {
  private readonly logger: Logger = new Logger(
    ConnectionStateGatewayController.name,
  );

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly connectionKafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.connectionKafkaClient.subscribeToResponseOf(
      'connections.change-connection-state',
    );
    this.connectionKafkaClient.subscribeToResponseOf(
      'connections.get-connection-state-history',
    );
    this.connectionKafkaClient.subscribeToResponseOf(
      'connections.get-connections-by-state',
    );
    this.connectionKafkaClient.subscribeToResponseOf(
      'connections.get-state-summary-dashboard',
    );
    this.connectionKafkaClient.subscribeToResponseOf(
      'connections.bulk-change-connection-state',
    );
    this.logger.log('ConnectionStateGatewayController initialized');
  }

  // ── State Summary Dashboard ────────────────────────────────────────────────

  @Get('summary-dashboard')
  @ApiOperation({
    summary: 'Method GET - Connection state KPI summary',
    description:
      'Returns a breakdown of how many connections are in each state, with percentages. Ideal for executive dashboards.',
  })
  async getStateSummaryDashboard(
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log('Fetching connection state summary dashboard');
      const response: StateSummaryResponse[] = await sendKafkaRequest(
        this.connectionKafkaClient.send(
          'connections.get-state-summary-dashboard',
          {},
        ),
      );
      return new ApiResponse(
        'Connection state summary retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  // ── Get Connections by State ───────────────────────────────────────────────

  @Get('by-state/:stateId')
  @ApiOperation({
    summary: 'Method GET - List connections by state',
    description:
      'Returns all connections currently in a given state (e.g. CORTADA_POR_MORA). Supports optional sector filter and pagination.',
  })
  async getConnectionsByState(
    @Req() request: Request,
    @Param('stateId', ParseIntPipe) stateId: number,
    @Query('sector') sector?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Fetching connections in state ${stateId}`);
      const response: ConnectionsByStateResponse[] = await sendKafkaRequest(
        this.connectionKafkaClient.send(
          'connections.get-connections-by-state',
          {
            stateId,
            sector: sector ? Number(sector) : undefined,
            limit: limit ? Number(limit) : 100,
            offset: offset ? Number(offset) : 0,
          },
        ),
      );
      return new ApiResponse(
        `Connections in state ${stateId} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  // ── State History ──────────────────────────────────────────────────────────

  @Get('history/:connectionId')
  @ApiOperation({
    summary: 'Method GET - Connection state history',
    description:
      'Returns the full audit trail of state changes for a specific connection, ordered by most recent first.',
  })
  async getConnectionStateHistory(
    @Req() request: Request,
    @Param('connectionId') connectionId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Fetching state history for connection: ${connectionId}`);
      const response: ConnectionStateHistoryResponse[] = await sendKafkaRequest(
        this.connectionKafkaClient.send(
          'connections.get-connection-state-history',
          {
            connectionId,
            limit: limit ? Number(limit) : 50,
            offset: offset ? Number(offset) : 0,
          },
        ),
      );
      return new ApiResponse(
        `State history for connection ${connectionId} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  // ── Change State ───────────────────────────────────────────────────────────

  @Post('change')
  @ApiOperation({
    summary: 'Method POST - Change connection state',
    description:
      'Changes the state of a single connection (e.g. suspend, reconnect, flag as fraud). Requires motivo for full audit trail.',
  })
  async changeConnectionState(
    @Req() request: Request,
    @Body() body: ChangeConnectionStateRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Changing state of connection ${body.connectionId} to state ${body.newStateId}`,
      );
      const response: ConnectionStateResponse = await sendKafkaRequest(
        this.connectionKafkaClient.send(
          'connections.change-connection-state',
          body,
        ),
      );
      return new ApiResponse(
        `Connection state changed successfully to ${response.currentStateName}!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  // ── Bulk State Change ──────────────────────────────────────────────────────

  @Post('bulk-change')
  @ApiOperation({
    summary: 'Method POST - Bulk connection state change',
    description:
      'Changes the state of multiple connections in a single operation. Ideal for mass suspension of delinquent accounts or batch reconnections.',
  })
  async bulkChangeConnectionState(
    @Req() request: Request,
    @Body() body: BulkChangeConnectionStateRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Bulk changing state of ${body.connectionIds.length} connections to state ${body.newStateId}`,
      );
      const response: BulkStateChangeResponse = await sendKafkaRequest(
        this.connectionKafkaClient.send(
          'connections.bulk-change-connection-state',
          body,
        ),
      );
      return new ApiResponse(
        `Bulk state change completed: ${response.updatedCount} connections updated to ${response.stateName}!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }
}
