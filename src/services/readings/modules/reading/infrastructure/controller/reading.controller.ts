import { Body, Controller, Get, Inject, Logger, OnModuleInit, Param, Post, Put, Req } from "@nestjs/common";
import { ClientKafka, RpcException } from "@nestjs/microservices";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { environments } from "src/settings/environments/environments";
import { ApiResponse } from "src/shared/errors/responses/ApiResponse";
import { sendKafkaRequest } from "src/shared/utils/kafka/send.kafka.request";
import { UpdateReadingRequest } from "../../domain/schemas/dto/request/update-reading.request";

@Controller('Readings')
@ApiTags('Readings')
export class ReadingGatewayController implements OnModuleInit {
  private readonly logger: Logger = new Logger(ReadingGatewayController.name)
  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka
  ) { }

  async onModuleInit() {
    this.readingClient.subscribeToResponseOf('reading.find-basic-reading')
    this.readingClient.subscribeToResponseOf('reading.update-current-reading')
    this.logger.log('Response patterns:', this.readingClient['responsePatterns']);
    this.logger.log(
      'ReadingController initialized and connected to Kafka',
    );
    await this.readingClient.connect();
  }

  @Get('find-basic-reading/:catastralCode')
  @ApiOperation({
    summary: 'Method GET - Find Basic Data for readings by catastral code',
    description: 'The endpoint allows you to search a Data Basic for readings'
  })
  async findQRCodeByAcometidaId(@Param('catastralCode') catastralCode: string, @Req() request: Request): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.readingClient.send(
          'reading.find-basic-reading', catastralCode
        )
      )
      return new ApiResponse(
        `QR Code with acometida ID ${catastralCode} found successfully!`, response, request.url
      )
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Put('update-current-reading/:readingId')
  @ApiOperation({
    summary: 'Method PUT - Update Current Reading by reading ID',
    description: 'The endpoint allows you to update a Current Reading'
  })
  async updateCurrentReading(@Param('readingId') readingId: string, @Body() readingRequest: UpdateReadingRequest, @Req() request: Request): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.readingClient.send(
          'reading.update-current-reading', { readingId, readingRequest }
        )
      )
      return new ApiResponse(
        `Current reading with reading ID ${readingId} updated successfully!`, response, request.url
      )
    } catch (error) {
      throw new RpcException(error)
    }
  }

}