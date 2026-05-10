import {
  Controller,
  Get,
  Inject,
  Logger,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

@Controller('worker-gateway')
@ApiTags('Worker Gateway Controller')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class WorkerGatewayController {
  private readonly logger = new Logger(WorkerGatewayController.name);
  // Define your endpoints and methods here
  constructor(
    @Inject(environments.GATEWAY_WORKERS_KAFKA_CLIENT)
    private readonly workerKafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Get('find-all-workers')
  async findAllWorkers(@Req() request: Request): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.workerKafkaClient, 'workers.find-all-workers', {}),
      );
      return new ApiResponse(
        'Workers retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in findAllWorkers: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Get('find-all-workers-paginated')
  async findAllWorkersPaginated(
    @Req() request: Request,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('query') query?: string,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.workerKafkaClient, 'workers.find-all-workers-paginated', {
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
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in findAllWorkersPaginated: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }
}
