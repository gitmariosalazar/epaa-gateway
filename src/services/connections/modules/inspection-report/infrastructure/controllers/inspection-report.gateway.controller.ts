import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';

class SubmitReportRequest {
  workOrderId!: string;
  solicitudId!: string;
  result!: string;
  networkDistanceM?: number;
  connectionDiameter?: string;
  terrainConditions?: string;
  observations?: string;
  longitude?: number;
  latitude?: number;
  materialCost?: number;
  laborCost?: number;
  technicianId!: string;
  completedStatusId!: number;
}

class ApproveReportRequest {
  reportId!: string;
  approved!: boolean;
  rejectionReason?: string;
  approverId!: string;
}

@Controller('inspection-report')
@ApiTags('inspection-report')
export class InspectionReportGatewayController {
  private readonly logger = new Logger(InspectionReportGatewayController.name);

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  /**
   * FASE 8: Subida de Informe Técnico
   * POST /inspection-report/ordenes/informe
   */
  @Post('ordenes/informe')
  @ApiOperation({
    summary: 'Fase 8: Enviar informe técnico de inspección',
    description:
      'El técnico sube su informe de campo. Cierra la OT y transiciona la solicitud a INFORME_EN_REVISION.',
  })
  async submitReport(
    @Body() body: SubmitReportRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Submitting inspection report for OT: ${body.workOrderId}`,
      );
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'inspection_report.submit',
          body,
        ),
      );
      return new ApiResponse(
        'Informe técnico enviado exitosamente',
        result,
        request.url,
        201,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  /**
   * FASE 9: Aprobación Técnica del Informe
   * PATCH /inspection-report/informes/aprobar
   */
  @Patch('informes/aprobar')
  @ApiOperation({
    summary: 'Fase 9: Aprobar o rechazar el informe técnico',
    description:
      'El jefe de operaciones emite su dictamen. Transiciona a INFORME_APROBADO o RECHAZADA_TECNICA.',
  })
  async approveReport(
    @Body() body: ApproveReportRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Approving inspection report: ${body.reportId}`);
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'inspection_report.approve',
          body,
        ),
      );
      return new ApiResponse(
        'Dictamen emitido exitosamente',
        result,
        request.url,
        200,
      );
    } catch (error) {
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('ordenes/:orderCodeOrRequestNumber/informe')
  @ApiOperation({
    summary:
      'Obtener informe técnico por código de orden o número de solicitud',
  })
  async getReport(
    @Req() request: Request,
    @Param('orderCodeOrRequestNumber') orderCodeOrRequestNumber: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Fetching inspection report for: ${orderCodeOrRequestNumber}`,
      );
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'inspection_report.get-by-order-code-or-request-number',
          { orderCodeOrRequestNumber },
        ),
      );
      return new ApiResponse(
        'Informe técnico obtenido exitosamente',
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
