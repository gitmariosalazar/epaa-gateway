import { Body, Controller, Inject, Logger, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';

class RegisterCadastralGatewayRequest {
  solicitudId!: string;
  contractId?: string;
  cadastralKey!: string;
  meterNumber!: string;
  exactAddress!: string;
  longitude!: number;
  latitude!: number;
  connectionDiameter?: string;
  serviceType?: string;
  installationDate!: string;
  accountNumber!: string;
  registratorId!: string;
}

@Controller('cadastral')
@ApiTags('cadastral')
export class CadastralGatewayController {
  private readonly logger = new Logger(CadastralGatewayController.name);

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  /**
   * FASE 14: Registro Catastral y Activación del Suministro (Estado final del proceso BPMN)
   * POST /cadastral/solicitudes/registro-catastral
   */
  @Post('solicitudes/registro-catastral')
  @ApiOperation({
    summary: 'Fase 14: Registro catastral y activación del suministro',
    description:
      'Cierre definitivo del proceso BPMN. Registra el predio en catastro, activa el suministro e ingresa el cliente a la cartera de facturación. Transiciona a SUMINISTRO_ACTIVO.',
  })
  async registerAndActivate(
    @Body() body: RegisterCadastralGatewayRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Registering catastral for solicitud: ${body.solicitudId}`,
      );
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'cadastral.register_and_activate',
          body,
        ),
      );
      return new ApiResponse(
        'Suministro activado y predio registrado en catastro exitosamente',
        result,
        request.url,
        201,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }
}
