import {
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Req,
  UseGuards
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { ObservationDetailsResponse } from '../../domain/schemas/dto/response/observation-dedtails.response';

@Controller('observations')
@ApiTags('Observations')
//@ApiBearerAuth()
//@UseGuards(AuthGuard)
export class ObservationsGatewayController {
  private readonly logger: Logger = new Logger(
    ObservationsGatewayController.name,
  );
  constructor(
    @Inject(environments.OBSERVATION_KAFKA_CLIENT)
    private readonly observationsClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Get('get-observation-details-by-cadastral-key/:cadastralKey')
  async getObservationDetailsByCadastralKey(
    @Param('cadastralKey') cadastralKey: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: ObservationDetailsResponse = await sendKafkaRequest(
        this.kafkaProxy.send(this.observationsClient, 
          'observation-reading.get-observation-details-by-cadastral-key', { cadastralKey },
        ),
      );
      return new ApiResponse(
        `Observation details for cadastral key ${cadastralKey} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error fetching observation details by cadastral key: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
  @Get('get-observations')
  async getObservations(@Req() request: Request): Promise<ApiResponse> {
    try {
      const response: ObservationDetailsResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(this.observationsClient, 
          'observation-reading.get-observations', {},
        ),
      );
      return new ApiResponse(
        `Observations retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error fetching observations: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
