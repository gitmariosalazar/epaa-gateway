import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

@Controller('worker-gateway')
@ApiTags('Worker Gateway Controller')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class WorkerGatewayController implements OnModuleInit {
  // Define your endpoints and methods here
  constructor(
    @Inject(environments.GATEWAY_WORKERS_KAFKA_CLIENT)
    private readonly workerKafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.workerKafkaClient.subscribeToResponseOf('workers.find-all-workers');
    this.workerKafkaClient.subscribeToResponseOf(
      'workers.find-all-workers-paginated',
    );
    await this.workerKafkaClient.connect();
  }

  @Get('find-all-workers')
  async findAllWorkers(@Req() request: Request): Promise<ApiResponse> {
    // Example method to demonstrate Kafka client usage
    const response = await sendKafkaRequest(
      this.workerKafkaClient.send('workers.find-all-workers', {}),
    );
    return new ApiResponse(
      'Workers retrieved successfully',
      response,
      request.url,
    );
  }

  @Get('find-all-workers-paginated')
  async findAllWorkersPaginated(
    @Req() request: Request,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('query') query?: string,
  ): Promise<ApiResponse> {
    // Example method to demonstrate Kafka client usage
    const response = await sendKafkaRequest(
      this.workerKafkaClient.send('workers.find-all-workers-paginated', {
        limit,
        offset,
        query,
      }),
    );
    return new ApiResponse(
      'Paginated workers retrieved successfully',
      response,
      request.url,
    );
  }
}
