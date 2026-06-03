import { Body, Controller, Inject, Logger, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';

class IssueInstallationOrderGatewayRequest {
  solicitudId: string;
  technicianId: string | null;
  description: string;
  priorityId: number;
  scheduledDate: string | null;
  creatorId: string;
}

class StartInstallationGatewayRequest {
  workOrderId: string;
  technicianId: string;
  startStatusId: number;
}

class CompleteInstallationGatewayRequest {
  workOrderId: string;
  userId: string;
  completedStatusId: number;
}

class FailInstallationGatewayRequest {
  workOrderId: string;
  userId: string;
  failureReason: string;
  failedStatusId: number;
}

@Controller('installation-order')
@ApiTags('installation-order')
export class InstallationOrderGatewayController {
  private readonly logger = new Logger(InstallationOrderGatewayController.name);

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  /**
   * FASE 12: Emitir Orden de Trabajo de Instalación
   * POST /installation-order/solicitudes/emitir-ot
   * Transición: CONTRATO_FIRMADO → OT_INSTALACION_EMITIDA
   */
  @Post('solicitudes/emitir-ot')
  @ApiOperation({
    summary: 'Fase 12: Emitir OT de instalación de acometida',
    description:
      'El analista genera la orden de trabajo de instalación física y la asigna a la cuadrilla técnica. Transiciona a OT_INSTALACION_EMITIDA.',
  })
  async issueOrder(
    @Body() body: IssueInstallationOrderGatewayRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Issuing installation order for solicitud: ${body.solicitudId}`);
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'installation_order.issue', body),
      );
      return new ApiResponse('Orden de instalación emitida exitosamente', result, request.url, 201);
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  /**
   * FASE 13a: Iniciar Instalación en Campo
   * PATCH /installation-order/ordenes/iniciar
   * Transición: OT_INSTALACION_EMITIDA → INSTALACION_EN_PROCESO
   */
  @Patch('ordenes/iniciar')
  @ApiOperation({
    summary: 'Fase 13a: Iniciar instalación en campo',
    description: 'La cuadrilla confirma el inicio de la instalación física. Transiciona a INSTALACION_EN_PROCESO.',
  })
  async startInstallation(
    @Body() body: StartInstallationGatewayRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Starting installation for OT: ${body.workOrderId}`);
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'installation_order.start', body),
      );
      return new ApiResponse('Instalación iniciada exitosamente', result, request.url, 200);
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  /**
   * FASE 13b: Completar Instalación
   * PATCH /installation-order/ordenes/completar
   * Transición: INSTALACION_EN_PROCESO → INSTALACION_COMPLETADA → REGISTRO_CATASTRAL_PENDIENTE
   */
  @Patch('ordenes/completar')
  @ApiOperation({
    summary: 'Fase 13b: Confirmar instalación completada',
    description:
      'La cuadrilla confirma la instalación exitosa. Transiciona a INSTALACION_COMPLETADA y automáticamente a REGISTRO_CATASTRAL_PENDIENTE.',
  })
  async completeInstallation(
    @Body() body: CompleteInstallationGatewayRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Completing installation for OT: ${body.workOrderId}`);
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'installation_order.complete', body),
      );
      return new ApiResponse(
        'Instalación completada. Solicitud derivada a catastro.',
        result,
        request.url,
        200,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  /**
   * FASE 13c: Instalación Fallida
   * PATCH /installation-order/ordenes/fallar
   * Transición: INSTALACION_EN_PROCESO → INSTALACION_FALLIDA
   */
  @Patch('ordenes/fallar')
  @ApiOperation({
    summary: 'Fase 13c: Registrar instalación fallida',
    description:
      'La cuadrilla reporta una falla en la instalación. Transiciona a INSTALACION_FALLIDA. La OT puede re-emitirse.',
  })
  async failInstallation(
    @Body() body: FailInstallationGatewayRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Failing installation for OT: ${body.workOrderId} — ${body.failureReason}`);
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'installation_order.fail', body),
      );
      return new ApiResponse('Falla de instalación registrada', result, request.url, 200);
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }
}
