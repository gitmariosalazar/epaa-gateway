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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation, ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { CreateWorkOrderRequest } from '../../domain/schemas/dto/request/create.work-order.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import {
  WORK_ORDER_IMAGES_FIELD,
  WORK_ORDER_IMAGES_MAX_FILES,
  removeUploadedFiles,
  toWorkOrderImageUrl,
  workOrderImagesMulterOptions,
} from '../upload/work-order-images.upload';

@Controller('work-orders')
@ApiTags('Work Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class WorkOrderGatewayController {
  private readonly logger = new Logger(WorkOrderGatewayController.name);

  constructor(
    @Inject(environments.GATEWAY_WORK_ORDER_KAFKA_CLIENT)
    private readonly workOrderKafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Post('create-work-order')
  @UseInterceptors(
    FilesInterceptor(
      WORK_ORDER_IMAGES_FIELD,
      WORK_ORDER_IMAGES_MAX_FILES,
      workOrderImagesMulterOptions,
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new work order (optionally with images)',
    description:
      'Creates a work order. Images are uploaded to the server (max 10, 10MB each, JPEG/PNG/GIF/WebP/BMP) and registered as attachments of the order.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'workTypeId',
        'priorityId',
        'status',
        'description',
        'location',
        'cadastralKey',
        'createdUserId',
        'clientId',
      ],
      properties: {
        orderCode: { type: 'string', example: 'WO-12345' },
        workTypeId: { type: 'integer', example: 2 },
        priorityId: { type: 'integer', example: 3 },
        clientId: { type: 'string', example: '1003938477' },
        status: { type: 'integer', example: 1 },
        description: {
          type: 'string',
          example: 'Fix the leaking pipe in the basement.',
        },
        location: { type: 'string', example: '123 Main St, Springfield' },
        createdUserId: {
          type: 'string',
          example: 'e3400d18-86e1-4eee-9a8b-3e7eaf812a95',
        },
        coordinates: { type: 'string', example: '40.7128° N, 74.0060° W' },
        metadata: { type: 'string', example: '{"key":"value"}' },
        cadastralKey: { type: 'string', example: 'ABC123XYZ' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Imágenes de la orden (opcional, máx. 10)',
        },
      },
    },
  })
  async createWorkOrder(
    @Body() workOrder: CreateWorkOrderRequest,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: Request,
  ): Promise<ApiResponse> {
    const uploadedFiles = files ?? [];
    try {
      // Nunca se confía en URLs enviadas por el cliente: se generan desde los archivos subidos.
      workOrder.images = uploadedFiles.map(toWorkOrderImageUrl);

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
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
      await removeUploadedFiles(uploadedFiles);
      const err = error as Error;
      this.logger.error(`Error in createWorkOrder: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.update-work-order',
          {
            orderCode,
            workOrder,
          },
        ),
      );
      return new ApiResponse(
        `Work order updated successfully`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in updateWorkOrder: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
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
      const err = error as Error;
      this.logger.error(`Error in getWorkOrderById: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
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
      const err = error as Error;
      this.logger.error(
        `Error in getWorkOrdersByClientId: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-all-work-orders')
  @ApiOperation({ summary: 'Get all work orders' })
  @ApiQuery({ name: 'searchValue', required: false, type: String })
  async getAllWorkOrders(
    @Req() request: Request,
    @Query('searchValue') searchValue?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.get-all-work-orders',
          {
            searchValue,
            limit,
            offset,
          },
        ),
      );
      return new ApiResponse(
        `All work orders retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getAllWorkOrders: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
    @Query('searchValue') searchValue?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.get-all-work-orders-full-details',
          { searchValue, limit, offset },
        ),
      );
      return new ApiResponse(
        `All work orders with full details retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getAllWorkOrdersFullDetails: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
    @Query('searchValue') searchValue?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.get-work-order-statistics',
          { searchValue, limit, offset },
        ),
      );
      return new ApiResponse(
        `Work order statistics retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getWorkOrderStatistics: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
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
      const err = error as Error;
      this.logger.error(
        `Error in getWorkOrderAssignments: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.get-work-order-materials',
          {
            limit,
            offset,
          },
        ),
      );
      return new ApiResponse(
        `Work order materials retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getWorkOrderMaterials: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
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
      const err = error as Error;
      this.logger.error(
        `Error in getWorkOrderObservations: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
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
      const err = error as Error;
      this.logger.error(
        `Error in getWorkOrderAttachments: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
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
      const err = error as Error;
      this.logger.error(
        `Error in getWorkOrdersByClient: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('find-work-orders-full-details-by-order-code')
  @ApiOperation({
    summary: 'Find work order full details',
    description:
      'Retrieve full details of a work order filtering by any combination of order code, client card id and cadastral key. All filters are optional but at least one is required.',
  })
  @ApiQuery({ name: 'orderCode', required: false, type: String })
  @ApiQuery({ name: 'cardId', required: false, type: String })
  @ApiQuery({ name: 'cadastralKey', required: false, type: String })
  async findWorkOrdersFullDetailsByOrderCode(
    @Req() request: Request,
    @Query('orderCode') orderCode?: string,
    @Query('cardId') cardId?: string,
    @Query('cadastralKey') cadastralKey?: string,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.find-work-orders-full-details-by-order-code',
          { orderCode, cardId, cadastralKey },
        ),
      );
      return new ApiResponse(
        `Work order full details retrieved successfully`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in findWorkOrdersFullDetailsByOrderCode: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
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
      const err = error as Error;
      this.logger.error(
        `Error in getWorkOrderPriorityStatistics: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
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
      const err = error as Error;
      this.logger.error(
        `Error in getWorkOrderStatusStatistics: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
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
      const err = error as Error;
      this.logger.error(
        `Error in getWorkOrderTypeStatistics: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
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
      const err = error as Error;
      this.logger.error(
        `Error in getWorkOrdersStatisticsKey: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
