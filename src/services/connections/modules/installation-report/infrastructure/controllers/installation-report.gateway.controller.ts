import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { AllowedUserTypes } from '../../../../../../auth/decorator/allowed-user-types.decorator';
import { AccessTokenPayload } from '../../../../../../shared/utils/interfaces/user.payload';

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
  private readonly logger = new Logger(
    InstallationReportGatewayController.name,
  );

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  private getUserIdFromRequest(request: Request): { userId: string } {
    const user: AccessTokenPayload = request['user'] as AccessTokenPayload;
    return { userId: user.sub };
  }

  @Post('ordenes/informe')
  @ApiOperation({
    summary: 'Fase 14: Enviar informe de instalación',
    description:
      'El técnico envía el informe de instalación del medidor. Se cierra la OT.',
  })
  @UseGuards(AuthGuard)
  @AllowedUserTypes('employee')
  @ApiBearerAuth()
  async submitReport(
    @Body() body: SubmitInstallationReportRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const { userId } = this.getUserIdFromRequest(request);
      body['userId'] = userId;

      this.logger.log(
        `Submitting installation report for OT: ${body.workOrderId}`,
      );
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

  @Get('ordenes/:orderCodeOrRequestNumber/informe')
  @ApiOperation({
    summary:
      'Obtener informe de instalación por código de orden o número de solicitud',
  })
  async getReportByOrderCodeOrRequestNumber(
    @Param('orderCodeOrRequestNumber') orderCodeOrRequestNumber: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'installation_report.get-by-order-code-or-request-number',
          { orderCodeOrRequestNumber },
        ),
      );
      return new ApiResponse(
        'Informe de instalación obtenido',
        result,
        request.url,
        200,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }
}
