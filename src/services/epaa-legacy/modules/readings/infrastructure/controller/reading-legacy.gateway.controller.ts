import { Body, Controller, Inject, Logger, OnModuleInit, Post, Req } from "@nestjs/common";
import { ClientKafka, RpcException } from "@nestjs/microservices";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { environments } from "src/settings/environments/environments";
import { ApiResponse } from "src/shared/errors/responses/ApiResponse";
import { CreateReadingLegacyRequest } from "../../domain/schemas/dto/request/create.reading-legacy.request";
import { sendKafkaRequest } from "src/shared/utils/kafka/send.kafka.request";

@Controller('readings')
@ApiTags('Readings - Legacy')
export class ReadingLegacyGatewayController implements OnModuleInit {
  private readonly logger = new Logger(ReadingLegacyGatewayController.name);
  constructor(
    @Inject(environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka
  ) { }
  async onModuleInit() {
    this.readingClient.subscribeToResponseOf('epaa-legacy.reading.create-reading-legacy')
    this.logger.log('Response patterns:', this.readingClient['responsePatterns']);
    this.logger.log(
      'ReadingLegacyGatewayController initialized and connected to Kafka',
    );
    await this.readingClient.connect();
  }

  @Post('create-reading-legacy')
  @ApiOperation({
    summary: 'Method POST - Create Reading (Legacy)',
    description: 'The endpoint allows you to create a Reading (Legacy)'
  })
  async createReading(@Req() request: Request, @Body() reading: CreateReadingLegacyRequest): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending createReading request: ${JSON.stringify(reading)}`);
      const response = await sendKafkaRequest(
        this.readingClient.send(
          'epaa-legacy.reading.create-reading-legacy', reading
        )
      );
      return new ApiResponse(
        `Reading created successfully!`, response, request.url
      )

    } catch (error) {
      this.logger.error(`Error in createReading: ${error.message}`, error.stack);
      throw new RpcException(error);
    }
  }

}
