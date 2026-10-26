import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { DistributeEmelnorteTrashRateRequest } from '../../domain/schemas/dto/request/distribute-emelnorte-trash-rate.request';
import { EmelnorteDistributionItemResponse } from '../../domain/schemas/dto/response/trash-rate.response';

/**
 * DistributeEmelnorteTrashRateUseCase — Application layer orchestrator (SRP + DIP).
 * Coordinates proportional distribution of EMELNORTE September trash rate across
 * active connections with penny remainder balancing and minimum floor enforcement.
 */
@Injectable()
export class DistributeEmelnorteTrashRateUseCase {
  private readonly logger = new Logger(DistributeEmelnorteTrashRateUseCase.name);

  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  async execute(
    request: DistributeEmelnorteTrashRateRequest,
  ): Promise<EmelnorteDistributionItemResponse[]> {
    this.logger.log(
      `Distributing EMELNORTE trash rate for clientId: ${request.clientId}, total: ${request.septemberTotal}`,
    );

    const response = await sendKafkaRequest<EmelnorteDistributionItemResponse[]>(
      this.kafkaProxy.send(
        this.readingClient,
        'reading.distribute-emelnorte-trash-rate',
        request,
      ),
    );

    return response;
  }
}
