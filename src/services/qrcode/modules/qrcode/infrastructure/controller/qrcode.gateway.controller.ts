import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateQRCodeRequest } from '../../domain/schemas/dto/request/create.qrcode.request';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

@Controller('QRCode')
@ApiTags('QRCode')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class QRCodeGatewayController {
  private readonly looger: Logger = new Logger(QRCodeGatewayController.name);
  constructor(
    @Inject(environments.QRCODE_KAFKA_CLIENT)
    private readonly qrcodeClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Post('create-qrcode')
  @ApiOperation({
    summary: 'Method POST - Create a new QRCode ✅',
    description:
      'The endpoint allows you to create a log entry for it. It requires a complete QRCode Object with all necessary details.',
  })
  async createQRCode(
    @Req() request: Request,
    @Body() qrcodeRequest: CreateQRCodeRequest,
  ): Promise<ApiResponse> {
    try {
      this.looger.log('Creating a new QRCode', qrcodeRequest);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.qrcodeClient, 'qrcode.create', qrcodeRequest),
      );

      return new ApiResponse(
        'QRCode created successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.looger.error(`Error creating QRCode: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Get('find-qrcode/:acometidaId')
  @ApiOperation({
    summary: 'Method GET - Find QR Code by acometidaId',
    description:
      'The endpoint allows you to search a QR Code for the ID Acometida',
  })
  async findQRCodeByAcometidaId(
    @Param('acometidaId') acometidaId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.qrcodeClient, 
          'qrcode.find-qrcode-by-acometidaId', acometidaId,
        ),
      );
      return new ApiResponse(
        `QR Code with acometida ID ${acometidaId} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.looger.error(
        `Error finding QRCode by acometidaId: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
