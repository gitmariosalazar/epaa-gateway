import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { CreateWorkOrderWorkerAssignmentRequest } from '../../domain/schemas/dto/request/create-work-order-worker-assignment.request';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

@Controller('work-order-worker-assignment')
@ApiTags('work-order-worker-assignment')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class WorkOrderWorkerAssignmentGatewayController implements OnModuleInit {
  constructor(
    @Inject(environments.GATEWAY_WORK_ORDER_WORKER_ASSIGNMENT_KAFKA_CLIENT)
    private readonly workOrderWorkerAssignmentKafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const requestPatterns = [
      'assignment-worker.add_worker_assignment_to_work_order_list',
      'assignment-worker.find_worker_assignment_by_worker_id',
      'assignment-worker.find_worker_assignments_by_work_order_id',
    ];

    requestPatterns.forEach((pattern) => {
      this.workOrderWorkerAssignmentKafkaClient.subscribeToResponseOf(pattern);
    });

    await this.workOrderWorkerAssignmentKafkaClient.connect();
  }

  @Post('add-work-order-worker-assignments')
  @ApiOperation({
    summary: 'Add worker assignments to work orders',
    description:
      'Add multiple worker assignments to work orders in a single request.',
  })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          workOrderId: { type: 'string', example: 'work-order-123' },
          workerId: { type: 'number', example: 4 },
          rolId: { type: 'number', example: 2 },
        },
        required: ['workOrderId', 'workerId', 'rolId'],
      },
    },
  })
  async addWorkerAssignmentToWorkOrderList(
    @Body() workerAssignments: CreateWorkOrderWorkerAssignmentRequest[],
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderWorkerAssignmentKafkaClient.send(
          'assignment-worker.add_worker_assignment_to_work_order_list',
          workerAssignments,
        ),
      );
      return new ApiResponse('', response, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-worker-assignment-by-worker-id/:workerId')
  @ApiOperation({
    summary: 'Find worker assignment by worker ID',
    description:
      'Retrieve worker assignments associated with a specific worker ID.',
  })
  async findWorkerAssignmentByWorkerId(
    @Req() request: Request,
    @Param('workerId') workerId: string,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderWorkerAssignmentKafkaClient.send(
          'assignment-worker.find_worker_assignment_by_worker_id',
          workerId,
        ),
      );
      return new ApiResponse('', response, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-worker-assignments-by-work-order-id/:workOrderId')
  @ApiOperation({
    summary: 'Find worker assignments by work order ID',
    description:
      'Retrieve worker assignments associated with a specific work order ID.',
  })
  async findWorkerAssignmentsByWorkOrderId(
    @Req() request: Request,
    @Param('workOrderId') workOrderId: string,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.workOrderWorkerAssignmentKafkaClient.send(
          'assignment-worker.find_worker_assignments_by_work_order_id',
          workOrderId,
        ),
      );
      return new ApiResponse('', response, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
