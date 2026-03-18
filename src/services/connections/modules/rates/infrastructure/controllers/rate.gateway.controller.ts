import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices/client/client-kafka';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { environments } from '../../../../../../settings/environments/environments';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { RateResponse } from '../../domain/schemas/dto/response/rate.response';
@Controller('connection-gateway')
@ApiTags('Connection Gateway')
export class RateGatewayController {
  private readonly logger: Logger = new Logger(RateGatewayController.name);

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  @Get('get-all-rates')
  @ApiOperation({
    summary: 'Get all rates',
    description: 'Retrieve a list of all rates',
  })
  async getAllRates(@Req() request: Request): Promise<ApiResponse> {
    try {
      const rates: RateResponse[] = await sendKafkaRequest(
        this.kafkaClient.send('rates.get-all-current-rates', {}),
      );
      return new ApiResponse(
        'Rates retrieved successfully',
        rates,
        request.url,
      );
    } catch (error) {
      this.logger.error('Failed to retrieve rates', error);
      throw new RpcException(error);
    }
  }
}
