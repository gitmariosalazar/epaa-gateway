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
import { CreateWorkHistoryRequest } from '../../domain/schemas/dto/request/creeate.work-order-history.request';
import { UpdateWorkOrderHistoryRequest } from '../../domain/schemas/dto/request/update.work-order-history.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

@Controller('work-order-histories')
@ApiTags('Work Order Histories')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class WorkOrderHistoryGatewayController implements OnModuleInit {
  private readonly logger = new Logger(WorkOrderHistoryGatewayController.name);

  constructor(
    @Inject(environments.GATEWAY_WORK_ORDER_HISTORY_KAFKA_CLIENT)
    private readonly workHistoryKafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.workHistoryKafkaClient.subscribeToResponseOf(
      'work-orders-histories.create-work-order-history',
    );
    this.workHistoryKafkaClient.subscribeToResponseOf(
      'work-orders-histories.update-work-order-history',
    );
    this.workHistoryKafkaClient.subscribeToResponseOf(
      'work-orders-histories.get-work-order-history-by-id',
    );
    this.workHistoryKafkaClient.subscribeToResponseOf(
      'work-orders-histories.get-work-order-histories-by-work-order-id',
    );
    this.workHistoryKafkaClient.subscribeToResponseOf(
      'work-orders-histories.get-all-work-order-histories',
    );
    this.workHistoryKafkaClient.subscribeToResponseOf(
      'work-orders-histories.find-all-view-histories-work-orders',
    );
    this.workHistoryKafkaClient.subscribeToResponseOf(
      'work-orders-histories.find-all-view-histories-work-orders-by-order-code',
    );
    this.logger.log(
      'WorkOrderHistoryController initialized and subscribed to Kafka topics.',
    );
    await this.workHistoryKafkaClient.connect();
  }

  @Post('create-work-order-history')
  @ApiOperation({
    summary: 'Create a new work order history',
    description: 'Creates a new work order history record in the system.',
  })
  async createWorkOrderHistory(
    @Body() workOrderHistory: CreateWorkHistoryRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    const response = await sendKafkaRequest(
      this.workHistoryKafkaClient.send(
        'work-orders-histories.create-work-order-history',
        workOrderHistory,
      ),
    );

    return new ApiResponse(
      `Work order history created successfully.`,
      response,
      request.url,
    );
  }

  @Put('update-work-order-history/:workOrderHistoryId')
  @ApiOperation({
    summary: 'Update an existing work order history',
    description:
      'Updates an existing work order history record identified by its ID.',
  })
  async updateWorkOrderHistory(
    @Param('workOrderHistoryId', ParseIntPipe) workOrderHistoryId: number,
    @Body() workOrderHistory: UpdateWorkOrderHistoryRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workHistoryKafkaClient.send(
          'work-orders-histories.update-work-order-history',
          { workOrderHistoryId, workOrderHistory },
        ),
      );

      return new ApiResponse(
        `Work order history updated successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-history-by-id/:workOrderHistoryId')
  @ApiOperation({
    summary: 'Get a work order history by its ID',
    description: 'Retrieves a work order history record by its unique ID.',
  })
  async getWorkOrderHistoryById(
    @Param('workOrderHistoryId', ParseIntPipe) workOrderHistoryId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workHistoryKafkaClient.send(
          'work-orders-histories.get-work-order-history-by-id',
          workOrderHistoryId,
        ),
      );

      return new ApiResponse(
        `Work order history retrieved successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-histories-by-work-order-id/:workOrderId')
  @ApiOperation({
    summary: 'Get work order histories by work order ID',
    description:
      'Retrieves all work order history records associated with a specific work order ID.',
  })
  async getWorkOrderHistoriesByWorkOrderId(
    @Param('workOrderId') workOrderId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workHistoryKafkaClient.send(
          'work-orders-histories.get-work-order-histories-by-work-order-id',
          workOrderId,
        ),
      );

      return new ApiResponse(
        `Work order histories retrieved successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-all-work-order-histories')
  @ApiOperation({
    summary: 'Get all work order histories',
    description: 'Retrieves all work order history records in the system.',
  })
  async getAllWorkOrderHistories(
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workHistoryKafkaClient.send(
          'work-orders-histories.get-all-work-order-histories',
          {},
        ),
      );
      return new ApiResponse(
        `All work order histories retrieved successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-all-view-histories-work-orders')
  @ApiOperation({
    summary: 'Find all view histories of work orders',
    description:
      'Retrieves a paginated list of view histories for work orders.',
  })
  async findAllViewHistoriesWorkOrders(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const pagination = { limit, offset };
      const response = await sendKafkaRequest(
        this.workHistoryKafkaClient.send(
          'work-orders-histories.find-all-view-histories-work-orders',
          pagination,
        ),
      );
      console.log(response);
      return new ApiResponse(
        `View histories of work orders retrieved successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-all-view-histories-work-orders-by-order-code/:orderCode')
  @ApiOperation({
    summary: 'Find all view histories of work orders by order code',
    description:
      'Retrieves a paginated list of view histories for work orders filtered by order code.',
  })
  async findAllViewHistoriesWorkOrdersByOrderCode(
    @Param('orderCode') orderCode: string,
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const pagination = { limit, offset };
      const response = await sendKafkaRequest(
        this.workHistoryKafkaClient.send(
          'work-orders-histories.find-all-view-histories-work-orders-by-order-code',
          { orderCode, pagination },
        ),
      );

      return new ApiResponse(
        `View histories of work orders by order code retrieved successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
