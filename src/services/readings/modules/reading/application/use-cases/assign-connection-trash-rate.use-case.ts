import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AssignConnectionTrashRateRequest } from '../../domain/schemas/dto/request/assign-connection-trash-rate.request';
import { TrashRateAssignmentResponse } from '../../domain/schemas/dto/response/trash-rate.response';

/**
 * AssignConnectionTrashRateUseCase — Application layer orchestrator (SRP + DIP).
 * Coordinates assigning individual, versioned trash rates to connections
 * based on category and tiered consumption schedule.
 */
@Injectable()
export class AssignConnectionTrashRateUseCase {
  private readonly logger = new Logger(AssignConnectionTrashRateUseCase.name);

  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  async execute(
    request: AssignConnectionTrashRateRequest,
  ): Promise<TrashRateAssignmentResponse> {
    this.logger.log(
      `Assigning trash rate for connectionId: ${request.connectionId}, category: ${request.categoryName}`,
    );

    const response = await sendKafkaRequest<TrashRateAssignmentResponse>(
      this.kafkaProxy.send(
        this.readingClient,
        'reading.assign-connection-trash-rate',
        request,
      ),
    );

    return response;
  }
}
