import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReadingLegacyRequest } from '../../domain/schemas/dto/request/create.reading-legacy.request';
import { environments } from '../../../../../../settings/environments/environments';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { FindCurrentReadingParams } from '../../domain/schemas/dto/request/find-current-reading-params';
import { UpdateReadingLegacyRequest } from '../../domain/schemas/dto/request/update.reading.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import {
  DashboardKpiResponse,
  ReadingResponse,
} from '../../domain/schemas/dto/response/readings.response';
import { CalculateReadingValueParams } from '../../domain/schemas/dto/request/calculate-reading-value-params';

@Controller('readings')
@ApiTags('Readings - Legacy')
//@ApiBearerAuth()
//@UseGuards(AuthGuard)
export class ReadingLegacyGatewayController {
  private readonly logger = new Logger(ReadingLegacyGatewayController.name);
  constructor(
    @Inject(environments.EPAA_LEGACY_READINGS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}
  @Get('find-current-reading')
  @ApiOperation({
    summary: 'Method GET - Find Current Reading (Legacy)',
    description: 'The endpoint allows you to find the current reading (Legacy)',
  })
  async findCurrentReading(
    @Req() request: Request,
    @Query() params: FindCurrentReadingParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending findCurrentReading request: ${JSON.stringify(params)}`,
      );

      const response: ReadingResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'epaa-legacy.reading.find-current-reading',
          params,
        ),
      );

      return new ApiResponse(
        `Current reading retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in findCurrentReading: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Put('update-current-reading')
  @ApiOperation({
    summary: 'Method PUT - Update Current Reading (Legacy)',
    description:
      'The endpoint allows you to update the current reading (Legacy)',
  })
  async updateCurrentReading(
    @Req() request: Request,
    @Query() params: FindCurrentReadingParams,
    @Body()
    readingRequest: UpdateReadingLegacyRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending updateCurrentReading request: ${JSON.stringify(readingRequest)}`,
      );
      const response: ReadingResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'epaa-legacy.reading.update-current-reading',
          {
            params: params,
            request: readingRequest,
          },
        ),
      );
      return new ApiResponse(
        `Current reading updated successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in updateCurrentReading: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('calculate-reading-value/:cadastralKey/:consumptionM3')
  @ApiOperation({
    summary: 'Method GET - Calculate Reading Value (Legacy)',
    description:
      'The endpoint allows you to calculate the reading value (Legacy)',
  })
  async calculateReadingValue(
    @Req() request: Request,
    @Query() parameters: CalculateReadingValueParams,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending calculateReadingValue request: ${JSON.stringify(parameters)}`,
      );

      const params = {
        cadastralKey: parameters.cadastralKey,
        consumptionM3: parameters.consumptionM3,
      };

      const response: number = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'epaa-legacy.reading.calculate-reading-value',
          params,
        ),
      );

      return new ApiResponse(
        `Reading value calculated successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in calculateReadingValue: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-dashboard-kpis-by-period')
  @ApiOperation({
    summary: 'Method GET - Get Dashboard KPIs by Period (Legacy)',
    description:
      'The endpoint allows you to get dashboard KPIs by period (Legacy)',
  })
  async getDashboardKpisByPeriod(
    @Req() request: Request,
    @Query('year') year: number,
    @Query('month') month: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getDashboardKpisByPeriod request: year=${year}, month=${month}`,
      );

      const params = {
        year: Number(year),
        month: month,
      };

      const response: DashboardKpiResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.readingClient,
          'epaa-legacy.reading.get-dashboard-kpis-by-period',
          params,
        ),
      );

      return new ApiResponse(
        `Dashboard KPIs retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getDashboardKpisByPeriod: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
