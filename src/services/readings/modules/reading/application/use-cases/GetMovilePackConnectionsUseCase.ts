import { Inject, Injectable, Logger } from '@nestjs/common';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { ClientKafka } from '@nestjs/microservices/client/client-kafka';
import { environments } from '../../../../../../settings/environments/environments';
import { AssignConnectionTrashRateUseCase } from './assign-connection-trash-rate.use-case';
import { ReadingInfoResponse } from '../../domain/schemas/dto/response/reading-basic.response';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';

@Injectable()
export class GetMovilePackConnectionsUseCase {
  private readonly logger = new Logger(GetMovilePackConnectionsUseCase.name);

  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}
  async execute(filters: { sector?: number; cadastralKeys?: string[] }) {
    this.logger.log(
      `Retrieving Movile Pack connections with filters: ${JSON.stringify(filters)}`,
    );
    const response = await sendKafkaRequest<ReadingInfoResponse[]>(
      this.kafkaProxy.send(
        this.readingClient,
        'reading.get-movile-pack-connections-sync-offline-batch',
        filters || {},
      ),
    );
    return response;
  }
}
