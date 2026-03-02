import {
  Controller,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { ReadingImagesResponse } from '../../domain/schemas/dto/response/reading.response';

@Controller('ReadingImages')
@ApiTags('Reading Images')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ReadingImagesGatewayController implements OnModuleInit {
  private readonly logger: Logger = new Logger(
    ReadingImagesGatewayController.name,
  );

  constructor(
    @Inject(environments.READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.readingClient.subscribeToResponseOf(
      'reading.find-reading-images-by-month',
    );
    this.readingClient.subscribeToResponseOf(
      'reading.find-reading-images-by-month-and-sector',
    );
    this.readingClient.subscribeToResponseOf(
      'reading.find-readings-image-by-cadastral-key',
    );
    this.readingClient.subscribeToResponseOf('reading.find-all-reading-images');

    this.logger.log(
      'ReadingImagesGatewayController initialized and connected to Kafka',
    );
    await this.readingClient.connect();
  }

  @Get('find-reading-images-by-month/:month')
  @ApiOperation({
    summary: 'Method GET - Find Reading Images by month',
    description: 'The endpoint allows you to search Reading Images by month',
  })
  async findReadingImagesByMonth(
    @Param('month') month: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: ReadingImagesResponse[] = await sendKafkaRequest(
        this.readingClient.send('reading.find-reading-images-by-month', {
          month,
        }),
      );
      return new ApiResponse(
        `Reading images for month ${month} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-reading-images-by-month-and-sector/:month/:sector')
  @ApiOperation({
    summary: 'Method GET - Find Reading Images by month and sector',
    description:
      'The endpoint allows you to search Reading Images by month and sector',
  })
  async findReadingImagesByMonthAndSector(
    @Param('month') month: string,
    @Param('sector', ParseIntPipe) sector: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: ReadingImagesResponse[] = await sendKafkaRequest(
        this.readingClient.send(
          'reading.find-reading-images-by-month-and-sector',
          { month, sector },
        ),
      );
      return new ApiResponse(
        `Reading images for month ${month} and sector ${sector} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-reading-images/:cadastralKey')
  @ApiOperation({
    summary: 'Method GET - Find Readings Images by cadastral key',
    description:
      'The endpoint allows you to search Readings Images by cadastral key',
  })
  async findReadingImagesByCadastralKey(
    @Param('cadastralKey') cadastralKey: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: ReadingImagesResponse[] = await sendKafkaRequest(
        this.readingClient.send(
          'reading.find-readings-image-by-cadastral-key',
          cadastralKey,
        ),
      );
      return new ApiResponse(
        `Readings images with cadastral key ${cadastralKey} found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-all-reading-images')
  @ApiOperation({
    summary: 'Method GET - Find All Readings Images',
    description: 'The endpoint allows you to search All Readings Images',
  })
  async findAllReadingImages(@Req() request: Request): Promise<ApiResponse> {
    try {
      const response: ReadingImagesResponse[] = await sendKafkaRequest(
        this.readingClient.send('reading.find-all-reading-images', {}),
      );
      return new ApiResponse(
        `All readings images found successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
