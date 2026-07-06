import { Body, Controller, Inject, Logger, Patch, Req, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';

class ConfirmPaymentGatewayRequest {
  invoiceId: string;
  paymentMethod: string;
  paymentReference: string;
  proofOfPaymentUrl?: string;
  collectorId: string;
}

class RejectPaymentGatewayRequest {
  adminId: string;
  reason: string;
}

@Controller('payment-confirmation')
@ApiTags('payment-confirmation')
export class PaymentConfirmationGatewayController {
  private readonly logger = new Logger(PaymentConfirmationGatewayController.name);

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  /**
   * FASE 5: Confirmación de Pago de Inspección
   * PATCH /payment-confirmation/facturas/pagar
   */
  @Patch('facturas/pagar')
  @ApiOperation({
    summary: 'Fase 5: Confirmar pago de factura de inspección',
    description:
      'Registra el pago de la factura de inspección y transiciona la solicitud al estado PAGO_CONFIRMADO.',
  })
  async confirmPayment(
    @Body() body: ConfirmPaymentGatewayRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Confirming payment for invoice: ${body.invoiceId}`);
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'payment_confirmation.confirm_payment',
          body,
        ),
      );
      return new ApiResponse('Pago confirmado exitosamente', result, request.url, 200);
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  /**
   * RECHAZO DE PAGO DE INSPECCIÓN
   * PATCH /payment-confirmation/facturas/:invoiceId/rechazar
   */
  @Patch('facturas/:invoiceId/rechazar')
  @ApiOperation({
    summary: 'Rechazar comprobante de pago',
    description:
      'Rechaza un comprobante de pago subido, devolviendo la solicitud a FACTURA_INSPECCION_EMITIDA.',
  })
  async rejectPayment(
    @Param('invoiceId') invoiceId: string,
    @Body() body: RejectPaymentGatewayRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Rejecting payment for invoice: ${invoiceId}`);
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'payment_confirmation.reject_payment',
          { invoiceId, ...body },
        ),
      );
      return new ApiResponse('Comprobante rechazado exitosamente', result, request.url, 200);
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }
}
