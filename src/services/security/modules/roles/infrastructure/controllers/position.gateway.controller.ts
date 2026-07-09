import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { CreatePositionRequest } from '../../domain/schemas/dto/request/create-position.request';
import { UpdatePositionRequest } from '../../domain/schemas/dto/request/update-position.request';
import { PositionResponse } from '../../domain/schemas/dto/response/position.response';

@Controller('positions')
@ApiTags('Positions (Cargos) - Gateway Authentication Service')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class PositionGatewayController {
  private readonly logger = new Logger(PositionGatewayController.name);

  constructor(
    @Inject(environments.GATEWAY_ROLES_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Post('create-position')
  @ApiOperation({
    summary: 'Create a new position (cargo)',
    description:
      'Creates a new position in the authentication service. Levels: 1 = Gerencia, 2 = Jefatura/Asesoría, 3 = Operativo.',
  })
  async createPosition(
    @Body() positionData: CreatePositionRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    this.logger.log(
      'Sending create position request to authentication service',
    );
    try {
      const response: PositionResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'authentication.positions.create_position',
          positionData,
        ),
      );

      return new ApiResponse(
        'Position created successfully.',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error creating position: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Put('update-position/:positionId')
  @ApiOperation({
    summary: 'Update an existing position (cargo)',
    description:
      'Updates name, description, hierarchical level or active status of a position.',
  })
  async updatePosition(
    @Param('positionId', ParseIntPipe) positionId: number,
    @Body() positionData: UpdatePositionRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    this.logger.log(
      'Sending update position request to authentication service',
    );
    try {
      const payload = { positionId, positionData };
      const response: PositionResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'authentication.positions.update_position',
          payload,
        ),
      );

      return new ApiResponse(
        `Position with ID ${positionId} updated successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error updating position: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-position-by-id/:positionId')
  @ApiOperation({
    summary: 'Get position by ID',
    description: 'Retrieves a position (cargo) by its ID.',
  })
  async getPositionById(
    @Param('positionId', ParseIntPipe) positionId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    this.logger.log(
      'Sending get position by ID request to authentication service',
    );
    try {
      const response: PositionResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'authentication.positions.get_position_by_id',
          positionId,
        ),
      );

      return new ApiResponse(
        `Position with ID ${positionId} retrieved successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error getting position by ID: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-all-positions')
  @ApiOperation({
    summary: 'Get all positions (cargos)',
    description:
      'Retrieves all positions ordered by hierarchical level and name.',
  })
  async getAllPositions(@Req() request: Request): Promise<ApiResponse> {
    this.logger.log(
      'Sending get all positions request to authentication service',
    );
    try {
      const response: PositionResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'authentication.positions.get_all_positions',
          {},
        ),
      );

      return new ApiResponse(
        'Positions retrieved successfully.',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error getting all positions: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Delete('disable-position/:positionId')
  @ApiOperation({
    summary: 'Disable a position (cargo)',
    description:
      'Soft-disables a position by setting activo = false. The record is not deleted.',
  })
  async disablePosition(
    @Param('positionId', ParseIntPipe) positionId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    this.logger.log(
      'Sending disable position request to authentication service',
    );
    try {
      const response: boolean = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'authentication.positions.disable_position',
          positionId,
        ),
      );

      return new ApiResponse(
        `Position with ID ${positionId} disabled successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error disabling position: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }
}
