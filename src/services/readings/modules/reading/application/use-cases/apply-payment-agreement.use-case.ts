import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { ApplyPaymentAgreementRequest } from '../../domain/schemas/dto/request/apply-payment-agreement.request';
import { PaymentAgreementResponse } from '../../domain/schemas/dto/response/payment-agreement.response';

/**
 * ApplyPaymentAgreementUseCase — Application layer orchestrator (SRP + DIP).
 * Coordinates applying a payment agreement to reading invoices, zeroing designated
 * concepts (such as TASA_BASURA) and storing deferred balances.
 */
@Injectable()
export class ApplyPaymentAgreementUseCase {
  private readonly logger = new Logger(ApplyPaymentAgreementUseCase.name);

  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  async execute(
    request: ApplyPaymentAgreementRequest,
  ): Promise<PaymentAgreementResponse> {
    this.logger.log(
      `Sending apply payment agreement request for agreementCode: ${request.agreementCode}, connectionId: ${request.connectionId}`,
    );

    const response = await sendKafkaRequest<PaymentAgreementResponse>(
      this.kafkaProxy.send(
        this.readingClient,
        'reading.apply-payment-agreement',
        request,
      ),
    );

    return response;
  }
}
