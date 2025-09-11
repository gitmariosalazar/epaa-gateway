import { Body, Controller, Get, Inject, Logger, OnModuleInit, Param, Post, Req } from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from 'src/settings/environments/environments';
import { CreateQRCodeRequest } from '../../domain/schemas/dto/request/create.qrcode.request';
import { ApiResponse } from 'src/shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from 'src/shared/utils/kafka/send.kafka.request';

@Controller('QRCode')
@ApiTags('QRCode')
export class QRCodeGatewayController implements OnModuleInit {
  private readonly looger: Logger = new Logger(QRCodeGatewayController.name);
  constructor(
    @Inject(environments.QRCODE_KAFKA_CLIENT)
    private readonly qrcodeClient: ClientKafka,
  ) { }

  async onModuleInit() {
    this.qrcodeClient.subscribeToResponseOf('qrcode.create');
    this.qrcodeClient.subscribeToResponseOf('qrcode.find-qrcode-by-acometidaId')
    this.looger.log('Response patterns:', this.qrcodeClient['responsePatterns']);

    this.looger.log(
      'QRCodeGatewayController initialized and connected to Kafka',
    );
    await this.qrcodeClient.connect();
  }

  @Post('create-qrcode')
  @ApiOperation({
    summary: 'Method POST - Create a new QRCode ✅',
    description: 'The endpoint allows you to create a log entry for it. It requires a complete QRCode Object with all necessary details.'
  })
  async createQRCode(
    @Req() request: Request,
    @Body() qrcodeRequest: CreateQRCodeRequest
  ): Promise<ApiResponse> {
    try {
      this.looger.log('Creating a new QRCode', qrcodeRequest)
      const response = await sendKafkaRequest(
        this.qrcodeClient.send(
          'qrcode.create', qrcodeRequest
        )
      )

      return new ApiResponse(
        'QRCode created successfully!', response, request.url
      )
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Get('find-qrcode/:acometidaId')
  @ApiOperation({
    summary: 'Method GET - Find QR Code by acometidaId',
    description: 'The endpoint allows you to search a QR Code for the ID Acometida'
  })
  async findQRCodeByAcometidaId(@Param('acometidaId') acometidaId: string, @Req() request: Request): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.qrcodeClient.send(
          'qrcode.find-qrcode-by-acometidaId', acometidaId
        )
      )
      return new ApiResponse(
        `QR Code with acometida ID ${acometidaId} found successfully!`, response, request.url
      )
    } catch (error) {
      throw new RpcException(error)
    }
  }
}
