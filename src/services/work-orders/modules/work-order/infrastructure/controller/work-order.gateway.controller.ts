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
import { CreateWorkOrderRequest } from '../../domain/schemas/dto/request/create.work-order.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

@Controller('work-orders')
@ApiTags('Work Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class WorkOrderGatewayController implements OnModuleInit {
  private readonly logger = new Logger(WorkOrderGatewayController.name);

  constructor(
    @Inject(environments.GATEWAY_WORK_ORDER_KAFKA_CLIENT)
    private readonly workOrderKafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const requestPatterns = [
      'work-orders.create-work-order',
      'work-orders.update-work-order',
      'work-orders.get-work-order-by-order-code',
      'work-orders.get-work-orders-by-client-id',
      'work-orders.get-all-work-orders',
      'work-orders.get-all-work-orders-full-details',
      'work-orders.get-work-order-statistics',
      'work-orders.get-work-order-assignments',
      'work-orders.get-work-order-materials',
      'work-orders.get-work-order-observations',
      'work-orders.get-work-order-attachments',
      'work-orders.get-work-orders-by-client',
      'work-orders.find-work-orders-full-details-by-order-code',
      'work-orders.get-work-order-priority-statistics',
      'work-orders.get-work-order-status-statistics',
      'work-orders.get-work-order-type-statistics',
      'work-orders.get-work-orders-statistics-key',
    ];

    requestPatterns.forEach((pattern) => {
      this.workOrderKafkaClient.subscribeToResponseOf(pattern);
    });
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

  @Put('update-work-order/:orderCode')
  @ApiOperation({ summary: 'Update an existing work order' })
  async updateWorkOrder(
    @Param('orderCode') orderCode: string,
    @Body() workOrder: CreateWorkOrderRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send('work-orders.update-work-order', {
          orderCode,
          workOrder,
        }),
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

  @Get('get-work-order-by-order-code/:orderCode')
  @ApiOperation({ summary: 'Get a work order by its ID' })
  async getWorkOrderById(
    @Param('orderCode') orderCode: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.get-work-order-by-order-code',
          orderCode,
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
  async getAllWorkOrders(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send('work-orders.get-all-work-orders', {
          limit,
          offset,
        }),
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

  @Get('get-all-work-orders-full-details')
  @ApiOperation({
    summary: 'Get all work orders with full details',
    description:
      'Retrieve all work orders along with their full details, including assignments, materials, observations, and attachments.',
  })
  async getAllWorkOrdersFullDetails(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.get-all-work-orders-full-details',
          { limit, offset },
        ),
      );
      return new ApiResponse(
        `All work orders with full details retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-statistics')
  @ApiOperation({
    summary: 'Get work order statistics',
    description:
      'Retrieve statistical data related to work orders, such as counts and averages.',
  })
  async getWorkOrderStatistics(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.get-work-order-statistics',
          { limit, offset },
        ),
      );
      return new ApiResponse(
        `Work order statistics retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-assignments')
  @ApiOperation({
    summary: 'Get work order assignments',
    description:
      'Retrieve assignments related to work orders, including assigned personnel and roles.',
  })
  async getWorkOrderAssignments(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.get-work-order-assignments',
          { limit, offset },
        ),
      );
      return new ApiResponse(
        `Work order assignments retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-materials')
  @ApiOperation({
    summary: 'Get work order materials',
    description:
      'Retrieve materials associated with work orders, including quantities and specifications.',
  })
  async getWorkOrderMaterials(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send('work-orders.get-work-order-materials', {
          limit,
          offset,
        }),
      );
      return new ApiResponse(
        `Work order materials retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-observations')
  @ApiOperation({
    summary: 'Get work order observations',
    description:
      'Retrieve observations and notes related to work orders, including timestamps and authors.',
  })
  async getWorkOrderObservations(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.get-work-order-observations',
          { limit, offset },
        ),
      );
      return new ApiResponse(
        `Work order observations retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-attachments')
  @ApiOperation({
    summary: 'Get work order attachments',
    description:
      'Retrieve attachments related to work orders, including file names and types.',
  })
  async getWorkOrderAttachments(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.get-work-order-attachments',
          { limit, offset },
        ),
      );
      return new ApiResponse(
        `Work order attachments retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-orders-by-client')
  @ApiOperation({
    summary: 'Get work orders by client',
    description:
      'Retrieve work orders associated with specific clients, including client details.',
  })
  async getWorkOrdersByClient(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.get-work-orders-by-client',
          { limit, offset },
        ),
      );
      return new ApiResponse(
        `Work orders by client retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-work-orders-full-details-by-order-code/:orderCode')
  @ApiOperation({
    summary: 'Find work orders full details by order code',
    description:
      'Retrieve full details of a work order using its order code, including assignments, materials, observations, and attachments.',
  })
  async findWorkOrdersFullDetailsByOrderCode(
    @Req() request: Request,
    @Param('orderCode') orderCode: string,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.find-work-orders-full-details-by-order-code',
          orderCode,
        ),
      );
      return new ApiResponse(
        `Work order full details retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-priority-statistics')
  @ApiOperation({
    summary: 'Get work order priority statistics',
    description: 'Retrieve statistical data related to work order priorities.',
  })
  async getWorkOrderPriorityStatistics(
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.get-work-order-priority-statistics',
          {},
        ),
      );
      return new ApiResponse(
        `Work order priority statistics retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-status-statistics')
  @ApiOperation({
    summary: 'Get work order status statistics',
    description: 'Retrieve statistical data related to work order statuses.',
  })
  async getWorkOrderStatusStatistics(
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.get-work-order-status-statistics',
          {},
        ),
      );
      return new ApiResponse(
        `Work order status statistics retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-type-statistics')
  @ApiOperation({
    summary: 'Get work order type statistics',
    description: 'Retrieve statistical data related to work order types.',
  })
  async getWorkOrderTypeStatistics(
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.get-work-order-type-statistics',
          {},
        ),
      );
      return new ApiResponse(
        `Work order type statistics retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-orders-statistics-key')
  @ApiOperation({
    summary: 'Get work orders statistics key',
    description: 'Retrieve key statistical data related to work orders.',
  })
  async getWorkOrdersStatisticsKey(
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderKafkaClient.send(
          'work-orders.get-work-orders-statistics-key',
          {},
        ),
      );
      return new ApiResponse(
        `Work orders statistics key retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
