import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';

class SubmitInstallationReportRequest {
  workOrderId!: string;
  result!: string;
  meterNumber?: string;
  initialReading?: number;
  securitySeal?: string;
  connectionDiameter?: string;
  geomMeter?: string;
  finalConditions?: string;
  observations?: string;
  clientSignatureUrl?: string;
}

@Controller('installation-report')
@ApiTags('installation-report')
export class InstallationReportGatewayController {
  private readonly logger = new Logger(InstallationReportGatewayController.name);

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Post('ordenes/informe')
  @ApiOperation({
    summary: 'Fase 14: Enviar informe de instalación',
    description: 'El técnico envía el informe de instalación del medidor. Se cierra la OT.',
  })
  async submitReport(
    @Body() body: SubmitInstallationReportRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Submitting installation report for OT: ${body.workOrderId}`);
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'installation_report.submit',
          body,
        ),
      );
      return new ApiResponse(
        'Informe de instalación enviado exitosamente',
        result,
        request.url,
        201,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('ordenes/:workOrderId/informe')
  @ApiOperation({
    summary: 'Obtener informe de instalación por OT',
  })
  async getReport(
    @Param('workOrderId') workOrderId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'installation_report.get',
          { workOrderId },
        ),
      );
      return new ApiResponse('Informe de instalación obtenido', result, request.url, 200);
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }
}
