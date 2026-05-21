import { Body, Controller, Inject, Logger, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';

class GenerateContractGatewayRequest {
  solicitudId: string;
  contractNumber: string;
  tariffId?: number;
  materialCost: number;
  laborCost: number;
  connectionFee: number;
  generatorId: string;
}

class SignContractGatewayRequest {
  contractId: string;
  signatureStatus: 'FIRMADO_CLIENTE' | 'FIRMADO_EPAA' | 'COMPLETO';
  signedContractUrl: string;
  userId: string;
}

@Controller('contracts')
@ApiTags('contracts')
export class ContractsGatewayController {
  private readonly logger = new Logger(ContractsGatewayController.name);

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  /**
   * FASE 10: Generación de Contrato
   * POST /contracts/solicitudes/generar
   */
  @Post('solicitudes/generar')
  @ApiOperation({
    summary: 'Fase 10: Generar contrato de servicio',
    description: 'Crea el documento de contrato basado en los datos del informe de inspección aprobado. Transiciona a CONTRATO_GENERADO.',
  })
  async generateContract(@Body() body: GenerateContractGatewayRequest, @Req() request: Request): Promise<ApiResponse> {
    try {
      this.logger.log(`Generating contract for solicitud: ${body.solicitudId}`);
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'contracts.generate', body),
      );
      return new ApiResponse('Contrato generado exitosamente', result, request.url, 201);
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  /**
   * FASE 11: Firma de Contrato
   * PATCH /contracts/firmar
   */
  @Patch('firmar')
  @ApiOperation({
    summary: 'Fase 11: Registrar firma del contrato',
    description: 'Registra la firma de una de las partes. Cuando estado_firma = COMPLETO transiciona la solicitud a CONTRATO_FIRMADO.',
  })
  async signContract(@Body() body: SignContractGatewayRequest, @Req() request: Request): Promise<ApiResponse> {
    try {
      this.logger.log(`Signing contract: ${body.contractId} | status: ${body.signatureStatus}`);
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'contracts.sign', body),
      );
      return new ApiResponse('Firma registrada exitosamente', result, request.url, 200);
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }
}
