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
import { CreateWorkOrderTypeRequest } from '../../domain/schemas/dto/request/create.work-order-type.request';
import { UpdateWorkOrderTypeRequest } from '../../domain/schemas/dto/request/update.work-order-type.request';

@Controller('work-order-types')
@ApiTags('Work Order Types Gateway')
export class WorkOrderTypeGatewayController implements OnModuleInit {
  private readonly logger = new Logger(WorkOrderTypeGatewayController.name);
  constructor(
    @Inject(environments.GATEWAY_WORK_ORDER_TYPE_KAFKA_CLIENT)
    private readonly workOrderTypeKafkaClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.logger.log('WorkOrderTypeGatewayController initialized');
    this.workOrderTypeKafkaClient.subscribeToResponseOf(
      'work-order-type.create-work-order-type',
    );
    this.workOrderTypeKafkaClient.subscribeToResponseOf(
      'work-order-type.update-work-order-type',
    );
    this.workOrderTypeKafkaClient.subscribeToResponseOf(
      'work-order-type.get-work-order-type-by-id',
    );
    this.workOrderTypeKafkaClient.subscribeToResponseOf(
      'work-order-type.get-all-work-order-types',
    );
    this.workOrderTypeKafkaClient.subscribeToResponseOf(
      'work-order-type.verify-work-order-type-exists-by-name',
    );
    this.logger.log(
      'Response patterns:',
      this.workOrderTypeKafkaClient['responsePatterns'],
    );
    this.workOrderTypeKafkaClient.connect();
  }

  @Post('create-work-order-type')
  @ApiOperation({
    summary: 'Method POST - Create a new work order type',
    description:
      'The endpoint allows you to create a new work order type in the system',
  })
  async createWorkOrderType(
    @Req() request: Request,
    @Body() workOrderType: CreateWorkOrderTypeRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to create work order type: ${JSON.stringify(
          workOrderType,
        )}`,
      );
      const response = await sendKafkaRequest(
        this.workOrderTypeKafkaClient.send(
          'work-order-type.create-work-order-type',
          workOrderType,
        ),
      );
      this.logger.log(
        `Work order type created successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Work order type created successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('update-work-order-type/:workOrderTypeId')
  @ApiOperation({
    summary: 'Method PUT - Update an existing work order type',
    description:
      'The endpoint allows you to update an existing work order type in the system',
  })
  async updateWorkOrderType(
    @Req() request: Request,
    @Param('workOrderTypeId', ParseIntPipe) workOrderTypeId: number,
    @Body() workOrderType: UpdateWorkOrderTypeRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to update work order type: ${JSON.stringify(
          workOrderType,
        )}`,
      );
      const response = await sendKafkaRequest(
        this.workOrderTypeKafkaClient.send(
          'work-order-type.update-work-order-type',
          { workOrderTypeId, workOrderType },
        ),
      );
      this.logger.log(
        `Work order type updated successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Work order type updated successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-type-by-id/:workOrderTypeId')
  @ApiOperation({
    summary: 'Method GET - Get work order type by ID',
    description:
      'The endpoint allows you to get a work order type by its ID from the system',
  })
  async getWorkOrderTypeById(
    @Req() request: Request,
    @Param('workOrderTypeId', ParseIntPipe) workOrderTypeId: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to get work order type by ID: ${workOrderTypeId}`,
      );
      const response = await sendKafkaRequest(
        this.workOrderTypeKafkaClient.send(
          'work-order-type.get-work-order-type-by-id',
          workOrderTypeId,
        ),
      );
      this.logger.log(
        `Work order type retrieved successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Work order type retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-all-work-order-types')
  @ApiOperation({
    summary: 'Method GET - Get all work order types',
    description:
      'The endpoint allows you to get all work order types from the system',
  })
  async getAllWorkOrderTypes(@Req() request: Request): Promise<ApiResponse> {
    try {
      this.logger.log(`Received request to get all work order types`);
      const response = await sendKafkaRequest(
        this.workOrderTypeKafkaClient.send(
          'work-order-type.get-all-work-order-types',
          {},
        ),
      );
      this.logger.log(
        `Work order types retrieved successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Work order types retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('verify-work-order-type-exists-by-name')
  @ApiOperation({
    summary: 'Method GET - Verify work order type exists by name',
    description:
      'The endpoint allows you to verify if a work order type exists by its name in the system',
  })
  async verifyWorkOrderTypeExistsByName(
    @Req() request: Request,
    @Query('workOrderTypeName') workOrderTypeName: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to verify work order type exists by name: ${workOrderTypeName}`,
      );
      const response = await sendKafkaRequest(
        this.workOrderTypeKafkaClient.send(
          'work-order-type.verify-work-order-type-exists-by-name',
          workOrderTypeName,
        ),
      );
      this.logger.log(
        `Work order type existence verified successfully: ${JSON.stringify(
          response,
        )}`,
      );
      return new ApiResponse(
        `Work order type existence verified successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
