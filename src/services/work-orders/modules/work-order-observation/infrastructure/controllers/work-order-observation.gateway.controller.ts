import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { CreateWorkOrderObservationRequest } from '../../domain/schemas/dto/request/create.work-order-observation.request';
import { UpdateWorkOrderObservationRequest } from '../../domain/schemas/dto/request/update.work-order-observation.request';
import { UUID } from 'crypto';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

@Controller('work-order-observations')
@ApiTags('Work Order Observations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class WorkOrderObservationGatewayController implements OnModuleInit {
  private readonly logger = new Logger(
    WorkOrderObservationGatewayController.name,
  );

  constructor(
    @Inject(environments.GATEWAY_WORK_ORDER_OBSERVATION_KAFKA_CLIENT)
    private readonly workOrderObservationKafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.workOrderObservationKafkaClient.subscribeToResponseOf(
      'work-orders-observations.create-work-order-observation',
    );
    this.workOrderObservationKafkaClient.subscribeToResponseOf(
      'work-orders-observations.update-work-order-observation',
    );
    this.workOrderObservationKafkaClient.subscribeToResponseOf(
      'work-orders-observations.get-work-order-observation-by-id',
    );
    this.workOrderObservationKafkaClient.subscribeToResponseOf(
      'work-orders-observations.get-work-order-observations-by-work-order-id',
    );
    this.workOrderObservationKafkaClient.subscribeToResponseOf(
      'work-orders-observations.get-all-work-order-observations',
    );
    this.logger.log(
      'WorkOrderObservationController initialized and subscribed to Kafka topics.',
    );
    await this.workOrderObservationKafkaClient.connect();
  }

  @Post('create-work-order-observation')
  @ApiOperation({
    summary: 'Create a new work order observation',
    description: 'Creates a new work order observation record in the system.',
  })
  async createWorkOrderObservation(
    @Body() workOrderObservation: CreateWorkOrderObservationRequest,
    @Req() request: Request,
  ) {
    try {
      const response = await sendKafkaRequest(
        this.workOrderObservationKafkaClient.send(
          'work-orders-observations.create-work-order-observation',
          workOrderObservation,
        ),
      );
      return new ApiResponse(
        'Work order observation created successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('update-work-order-observation/:workOrderObservationId')
  @ApiOperation({
    summary: 'Update an existing work order observation',
    description:
      'Updates an existing work order observation record in the system.',
  })
  async updateWorkOrderObservation(
    @Body() workOrderObservation: UpdateWorkOrderObservationRequest,
    @Param('workOrderObservationId', ParseIntPipe)
    workOrderObservationId: number,
    @Req() request: Request,
  ) {
    try {
      const response = await sendKafkaRequest(
        this.workOrderObservationKafkaClient.send(
          'work-orders-observations.update-work-order-observation',
          { workOrderObservationId, workOrderObservation },
        ),
      );
      return new ApiResponse(
        'Work order observation updated successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-observation-by-id/:workOrderObservationId')
  @ApiOperation({
    summary: 'Get work order observation by ID',
    description: 'Retrieves a work order observation record by its ID.',
  })
  async getWorkOrderObservationById(
    @Param('workOrderObservationId', ParseIntPipe)
    workOrderObservationId: number,
    @Req() request: Request,
  ) {
    try {
      const response = await sendKafkaRequest(
        this.workOrderObservationKafkaClient.send(
          'work-orders-observations.get-work-order-observation-by-id',
          workOrderObservationId,
        ),
      );
      return new ApiResponse(
        'Work order observation retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-observations-by-work-order-id/:workOrderId')
  @ApiOperation({
    summary: 'Get work order observations by work order ID',
    description:
      'Retrieves all work order observation records associated with a specific work order ID.',
  })
  async getWorkOrderObservationsByWorkOrderId(
    @Param('workOrderId') workOrderId: UUID,
    @Req() request: Request,
  ) {
    try {
      const response = await sendKafkaRequest(
        this.workOrderObservationKafkaClient.send(
          'work-orders-observations.get-work-order-observations-by-work-order-id',
          workOrderId,
        ),
      );
      return new ApiResponse(
        'Work order observations retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-all-work-order-observations')
  @ApiOperation({
    summary: 'Get all work order observations',
    description: 'Retrieves all work order observation records in the system.',
  })
  async getAllWorkOrderObservations(@Req() request: Request) {
    try {
      const response = await sendKafkaRequest(
        this.workOrderObservationKafkaClient.send(
          'work-orders-observations.get-all-work-order-observations',
          {},
        ),
      );
      return new ApiResponse(
        'All work order observations retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
