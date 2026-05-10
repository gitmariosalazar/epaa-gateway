import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { CreateObservationConnectionRequest } from '../../domain/schemas/dto/request/create.observation-connection.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { ObservationConnectionResponse } from '../../domain/schemas/dto/response/observation-connection.response';

@Controller('observation-connection')
@ApiTags('Observation-Connection')
//@ApiBearerAuth()
//@UseGuards(AuthGuard)
export class ObservationConnectionGatewayController {
  private readonly logger = new Logger(
    ObservationConnectionGatewayController.name,
  );

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}
  @Post('create-observation-connection')
  @ApiOperation({ summary: 'Create a new observation connection' })
  async createObservationConnection(
    @Req() request: Request,
    @Body() observation: CreateObservationConnectionRequest,
  ): Promise<ApiResponse> {
    try {
      const response: ObservationConnectionResponse = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 
          'observation-connection.create-observation-connection', observation,
        ),
      );
      return new ApiResponse(
        'Observation connection created successfully',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error('Failed to create observation connection', error);
      throw new RpcException(error);
    }
  }

  @Get('get-all-observation-connections')
  @ApiOperation({ summary: 'Get all observation connections' })
  async getAllObservationConnections(
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: ObservationConnectionResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 
          'observation-connection.get-all-observation-connections', {},
        ),
      );
      return new ApiResponse(
        'All observation connections retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error('Failed to retrieve observation connections', error);
      throw new RpcException(error);
    }
  }

  @Get('get-observation-connections-by-observation-id/:observationId')
  @ApiOperation({ summary: 'Get observation connections by observation ID' })
  async getObservationConnectionsByObservationId(
    @Req() request: Request,
    @Param('observationId', ParseIntPipe) observationId: number,
  ): Promise<ApiResponse> {
    try {
      const response: ObservationConnectionResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 
          'observation-connection.get-observation-connections-by-observation-id', { observationId },
        ),
      );
      return new ApiResponse(
        'Observation connections retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        'Failed to retrieve observation connections by observation ID',
        error,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-observation-connections-by-connection-id/:connectionId')
  @ApiOperation({ summary: 'Get observation connections by connection ID' })
  async getObservationConnectionsByConnectionId(
    @Req() request: Request,
    @Param('connectionId') connectionId: string,
  ): Promise<ApiResponse> {
    try {
      const response: ObservationConnectionResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 
          'observation-connection.get-observation-connections-by-connection-id', { connectionId },
        ),
      );
      return new ApiResponse(
        'Observation connections retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        'Failed to retrieve observation connections by connection ID',
        error,
      );
      throw new RpcException(error);
    }
  }
}
