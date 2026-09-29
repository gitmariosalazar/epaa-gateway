import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../../../../auth/guard/auth.guard';
import { KafkaProxyService } from '../../../../../shared/kafka/kafka-proxy.service';
import { environments } from '../../../../../settings/environments/environments';
import { AccessTokenPayload } from '../../../../../shared/utils/interfaces/user.payload';
import { ApiResponse } from '../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../shared/utils/kafka/send.kafka.request';
import { MapGeojsonResponse } from '../../domain/schemas/dto/response/map-geojson';

@Controller('NetworkMap')
@ApiTags('NetworkMap')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class GisGatewayController {
  private readonly logger: Logger = new Logger(GisGatewayController.name);

  constructor(
    @Inject(environments.GATEWAY_NETWORK_OPERATIONS_KAFKA_CLIENT)
    private readonly readingClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  /** Extracts the authenticated user id set by AuthGuard onto the request. */
  private extractUserId(request: Request): string | undefined {
    const user: AccessTokenPayload = (request as any)[
      'user'
    ] as AccessTokenPayload;
    return user?.sub;
  }

  /** Extracts the username claim from the JWT payload (not the user id). */
  private extractUsername(request: Request): { username: string } {
    const user: AccessTokenPayload = (request as any)[
      'user'
    ] as AccessTokenPayload;
    return { username: user.username };
  }

  @Get('get-network-map')
  @ApiOperation({
    summary: 'Method GET - Retrieve network map by catastral code',
    description:
      'The endpoint allows you to retrieve the network map for a given catastral code',
  })
  async getNetworkMap(@Req() request: Request): Promise<ApiResponse> {
    try {
      const response: MapGeojsonResponse = await sendKafkaRequest(
        this.kafkaProxy.send(this.readingClient, 'gis.network.map', {}),
      );
      return new ApiResponse(
        `Network map retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving network map: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
