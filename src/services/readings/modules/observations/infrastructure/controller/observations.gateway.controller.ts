import {
  Controller,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
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
export class ObservationsGatewayController implements OnModuleInit {
  private readonly logger: Logger = new Logger(
    ObservationsGatewayController.name,
  );
  constructor(
    @Inject(environments.OBSERVATION_KAFKA_CLIENT)
    private readonly observationsClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.observationsClient.subscribeToResponseOf(
      'observation-reading.create-observation-reading',
    );
    this.observationsClient.subscribeToResponseOf(
      'observation-reading.get-observations-by-reading-id',
    );
    this.observationsClient.subscribeToResponseOf(
      'observation-reading.get-observation-details-by-cadastral-key',
    );
    this.observationsClient.subscribeToResponseOf(
      'observation-reading.get-observations',
    );
    this.logger.log(
      'Response patterns:',
      this.observationsClient['responsePatterns'],
    );
    this.logger.log(
      'ObservationsGatewayController initialized and connected to Kafka',
    );
    await this.observationsClient.connect();
  }

  @Get('get-observation-details-by-cadastral-key/:cadastralKey')
  async getObservationDetailsByCadastralKey(
    @Param('cadastralKey') cadastralKey: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: ObservationDetailsResponse = await sendKafkaRequest(
        this.observationsClient.send(
          'observation-reading.get-observation-details-by-cadastral-key',
          { cadastralKey },
        ),
      );
      return new ApiResponse(
        `Observation details for cadastral key ${cadastralKey} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        'Error fetching observation details by cadastral key',
        error,
      );
      throw new RpcException(error);
    }
  }
  @Get('get-observations')
  async getObservations(@Req() request: Request): Promise<ApiResponse> {
    try {
      const response: ObservationDetailsResponse[] = await sendKafkaRequest(
        this.observationsClient.send(
          'observation-reading.get-observations',
          {},
        ),
      );
      return new ApiResponse(
        `Observations retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error('Error fetching observations', error);
      throw new RpcException(error);
    }
  }
}
