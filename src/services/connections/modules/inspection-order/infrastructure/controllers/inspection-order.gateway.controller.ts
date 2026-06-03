import { Body, Controller, Inject, Logger, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';

class IssueInspectionOrderGatewayRequest {
  solicitudId: string;
  technicianId: string | null;
  description: string;
  priorityId: number;
  scheduledDate: string | null;
  creatorId: string;
}

class StartInspectionGatewayRequest {
  workOrderId: string;
  technicianId: string;
  /** ID del estado "EN_PROCESO" en work_orders.estado_orden_trabajo */
  startStatusId: number;
}

@Controller('inspection-order')
@ApiTags('inspection-order')
export class InspectionOrderGatewayController {
  private readonly logger = new Logger(InspectionOrderGatewayController.name);

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  /**
   * FASE 6: Emitir Orden de Inspección
   * POST /inspection-order/solicitudes/emitir
   * Transición: PAGO_CONFIRMADO → ORDEN_INSPECCION_EMITIDA
   */
  @Post('solicitudes/emitir')
  @ApiOperation({
    summary: 'Fase 6: Emitir orden de trabajo de inspección',
    description:
      'El analista genera la OT de inspección técnica, asigna al inspector y transiciona la solicitud a ORDEN_INSPECCION_EMITIDA.',
  })
  async issueOrder(
    @Body() body: IssueInspectionOrderGatewayRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Issuing inspection order for solicitud: ${body.solicitudId}`);
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'inspection_order.issue', body),
      );
      return new ApiResponse('Orden de inspección emitida exitosamente', result, request.url, 201);
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  /**
   * FASE 7: Iniciar Inspección en Campo
   * PATCH /inspection-order/ordenes/iniciar
   * Transición: ORDEN_INSPECCION_EMITIDA → INSPECCION_EN_PROCESO
   */
  @Patch('ordenes/iniciar')
  @ApiOperation({
    summary: 'Fase 7: Iniciar inspección en campo',
    description:
      'El inspector confirma el inicio de la visita técnica al predio. Transiciona la solicitud a INSPECCION_EN_PROCESO.',
  })
  async startInspection(
    @Body() body: StartInspectionGatewayRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Starting inspection for OT: ${body.workOrderId}`);
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'inspection_order.start', body),
      );
      return new ApiResponse('Inspección iniciada exitosamente', result, request.url, 200);
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }
}
