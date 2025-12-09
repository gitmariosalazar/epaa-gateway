import { Controller, Get, Inject, OnModuleInit, Req } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';

@Controller('worker-gateway')
@ApiTags('Worker Gateway Controller')
export class WorkerGatewayController implements OnModuleInit {
  // Define your endpoints and methods here
  constructor(
    @Inject(environments.GATEWAY_WORKERS_KAFKA_CLIENT)
    private readonly workerKafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.workerKafkaClient.subscribeToResponseOf('workers.find-all-workers');
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
}
