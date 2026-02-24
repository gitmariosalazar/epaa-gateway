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
import { CreateWorkTypeRequest } from '../../domain/schemas/dto/request/create.work-type.request';
import { UpdateWorkTypeRequest } from '../../domain/schemas/dto/request/update.work-type.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

@Controller('work-types')
@ApiTags('Work Types Gateway')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class WorkTypeGatewayController implements OnModuleInit {
  private readonly logger = new Logger(WorkTypeGatewayController.name);
  constructor(
    @Inject(environments.GATEWAY_WORK_TYPE_KAFKA_CLIENT)
    private readonly workTypeKafkaClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.logger.log('WorkOrderTypeGatewayController initialized');
    this.workTypeKafkaClient.subscribeToResponseOf(
      'work-type.create-work-type',
    );
    this.workTypeKafkaClient.subscribeToResponseOf(
      'work-type.update-work-type',
    );
    this.workTypeKafkaClient.subscribeToResponseOf(
      'work-type.get-work-type-by-id',
    );
    this.workTypeKafkaClient.subscribeToResponseOf(
      'work-type.get-all-work-types',
    );
    this.workTypeKafkaClient.subscribeToResponseOf(
      'work-type.verify-work-type-exists-by-name',
    );
    this.workTypeKafkaClient.subscribeToResponseOf(
      'work-type.find-work-types-by-department-id',
    );
    this.logger.log(
      'Response patterns:',
      this.workTypeKafkaClient['responsePatterns'],
    );
    this.workTypeKafkaClient.connect();
  }

  @Post('create-work-type')
  @ApiOperation({
    summary: 'Method POST - Create a new work type',
    description:
      'The endpoint allows you to create a new work type in the system',
  })
  async createWorkType(
    @Req() request: Request,
    @Body() workType: CreateWorkTypeRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to create work type: ${JSON.stringify(workType)}`,
      );
      const response = await sendKafkaRequest(
        this.workTypeKafkaClient.send('work-type.create-work-type', workType),
      );
      this.logger.log(
        `Work type created successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Work type created successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('update-work-type/:workTypeId')
  @ApiOperation({
    summary: 'Method PUT - Update an existing work type',
    description:
      'The endpoint allows you to update an existing work type in the system',
  })
  async updateWorkType(
    @Req() request: Request,
    @Param('workTypeId', ParseIntPipe) workTypeId: number,
    @Body() workType: UpdateWorkTypeRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to update work type: ${JSON.stringify(workType)}`,
      );
      const response = await sendKafkaRequest(
        this.workTypeKafkaClient.send('work-type.update-work-type', {
          workTypeId,
          workType,
        }),
      );
      this.logger.log(
        `Work type updated successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Work type updated successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-type-by-id/:workTypeId')
  @ApiOperation({
    summary: 'Method GET - Get work type by ID',
    description:
      'The endpoint allows you to get a work type by its ID from the system',
  })
  async getWorkTypeById(
    @Req() request: Request,
    @Param('workTypeId', ParseIntPipe) workTypeId: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Received request to get work type by ID: ${workTypeId}`);
      const response = await sendKafkaRequest(
        this.workTypeKafkaClient.send(
          'work-type.get-work-type-by-id',
          workTypeId,
        ),
      );
      this.logger.log(
        `Work type retrieved successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Work type retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-all-work-type-types')
  @ApiOperation({
    summary: 'Method GET - Get all work type types',
    description:
      'The endpoint allows you to get all work type types from the system',
  })
  async getAllWorkTypeTypes(@Req() request: Request): Promise<ApiResponse> {
    try {
      this.logger.log(`Received request to get all work type types`);
      const response = await sendKafkaRequest(
        this.workTypeKafkaClient.send('work-type.get-all-work-types', {}),
      );
      this.logger.log(
        `Work type types retrieved successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Work type types retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('verify-work-type-exists-by-name')
  @ApiOperation({
    summary: 'Method GET - Verify work type exists by name',
    description:
      'The endpoint allows you to verify if a work type exists by its name in the system',
  })
  async verifyWorkTypeExistsByName(
    @Req() request: Request,
    @Query('workTypeName') workTypeName: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to verify work type exists by name: ${workTypeName}`,
      );
      const response = await sendKafkaRequest(
        this.workTypeKafkaClient.send(
          'work-type.verify-work-type-exists-by-name',
          workTypeName,
        ),
      );
      this.logger.log(
        `Work type existence verified successfully: ${JSON.stringify(
          response,
        )}`,
      );
      return new ApiResponse(
        `Work type existence verified successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-work-types-by-department-id/:departmentId')
  @ApiOperation({
    summary: 'Method GET - Find work types by department ID',
    description:
      'The endpoint allows you to find work types associated with a specific department ID',
  })
  async findWorkTypesByDepartmentId(
    @Req() request: Request,
    @Param('departmentId', ParseIntPipe) departmentId: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to find work types by department ID: ${departmentId}`,
      );
      const response = await sendKafkaRequest(
        this.workTypeKafkaClient.send(
          'work-type.find-work-types-by-department-id',
          departmentId,
        ),
      );
      this.logger.log(
        `Work types retrieved successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Work types retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
