import { Body, Controller, Inject, Logger, Patch, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { ValidateDocumentsGatewayRequest } from '../../domain/schemas/dto/request/validation-document.request';

@Controller('document-validation')
@ApiTags('document-validation')
export class DocumentValidationGatewayController {
  private readonly logger = new Logger(
    DocumentValidationGatewayController.name,
  );

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  /**
   * FASE 3: Validación Documental
   * PATCH /document-validation/solicitudes/:solicitudId/validar
   */
  @Patch('solicitudes/validar')
  @ApiOperation({
    summary: 'Fase 3: Validar documentos de una solicitud',
    description:
      'Permite al analista aprobar o rechazar los documentos de una solicitud. Dispara automáticamente la transición de estado a DOCS_APPROVED o DOCS_REJECTED.',
  })
  async validateDocuments(
    @Body() body: ValidateDocumentsGatewayRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Validating documents for solicitud: ${body.solicitudId}`,
      );
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'document_validation.validate_documents',
          body,
        ),
      );
      return new ApiResponse(
        'Documentos validados exitosamente',
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
