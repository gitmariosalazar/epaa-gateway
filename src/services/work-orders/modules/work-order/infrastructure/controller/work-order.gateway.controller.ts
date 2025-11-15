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
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { CreateWorkOrderRequest } from '../../domain/schemas/dto/request/create.work-order.request';

@Controller('work-orders')
@ApiTags('Work Orders')
export class WorkOrderGatewayController implements OnModuleInit {
  private readonly logger = new Logger(WorkOrderGatewayController.name);

  constructor(
    @Inject(environments.WORK_ORDER_KAFKA_CLIENT)
    private readonly workOrderKafkaClient: ClientKafka,
  ) { }

  async onModuleInit() {
    this.workOrderKafkaClient.subscribeToResponseOf(
      'work-orders.create-work-order',
    );
    this.workOrderKafkaClient.subscribeToResponseOf(
      'work-orders.update-work-order',
    );
    this.workOrderKafkaClient.subscribeToResponseOf(
      'work-orders.get-work-order-by-id',
    );
    this.workOrderKafkaClient.subscribeToResponseOf(
      'work-orders.get-work-orders-by-client-id',
    );
    this.workOrderKafkaClient.subscribeToResponseOf(
      'work-orders.get-all-work-orders',
    );
    this.logger.log(
      'WorkOrderController initialized and subscribed to Kafka topics.',
    );
    await this.workOrderKafkaClient.connect();
  }

  @Post('create-work-order')
  @ApiOperation({ summary: 'Create a new work order' })
  async createWorkOrder(
    @Body() workOrder: CreateWorkOrderRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.create-work-order',
          workOrder,
        ),
      );
      return new ApiResponse(
        `Work order created successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('update-work-order/:workOrderId')
  @ApiOperation({ summary: 'Update an existing work order' })
  async updateWorkOrder(
    @Param('workOrderId', ParseIntPipe) workOrderId: number,
    @Body() workOrder: CreateWorkOrderRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.update-work-order',
          { workOrderId, workOrder },
        ),
      );
      return new ApiResponse(
        `Work order updated successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-by-id/:workOrderId')
  @ApiOperation({ summary: 'Get a work order by its ID' })
  async getWorkOrderById(
    @Param('workOrderId', ParseIntPipe) workOrderId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.get-work-order-by-id',
          workOrderId,
        ),
      );
      return new ApiResponse(
        `Work order retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-orders-by-client-id/:clientId')
  @ApiOperation({ summary: 'Get work orders by client ID' })
  async getWorkOrdersByClientId(
    @Param('clientId') clientId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.get-work-orders-by-client-id',
          clientId,
        ),
      );
      return new ApiResponse(
        `Work orders retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-all-work-orders')
  @ApiOperation({ summary: 'Get all work orders' })
  async getAllWorkOrders(@Req() request: Request): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send('work-orders.get-all-work-orders', {}),
      );
      return new ApiResponse(
        `All work orders retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
