import {
  Body,
  Controller,
  Delete,
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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { CreateRolRequest } from '../../domain/schemas/dto/request/create.rol.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { UpdateRolRequest } from '../../domain/schemas/dto/request/update.rol.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { RolResponse } from '../../domain/schemas/dto/response/rol.response';

@Controller('roles')
@ApiTags('Roles - Gateway Authentication Service')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class RolGatewayController implements OnModuleInit {
  private readonly logger = new Logger(RolGatewayController.name);

  constructor(
    @Inject(environments.GATEWAY_ROLES_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  onModuleInit() {
    const requestPatterns = [
      'authentication.roles.get_rol_by_id',
      'authentication.roles.get_all_rols',
      'authentication.roles.create_rol',
      'authentication.roles.update_rol',
    ];

    requestPatterns.forEach((pattern) => {
      this.kafkaClient.subscribeToResponseOf(pattern);
    });
  }

  @Post('create-rol')
  @ApiOperation({
    summary: 'Create a new role',
    description: 'Creates a new role in the authentication service.',
  })
  async createRol(
    @Body() rolData: CreateRolRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    this.logger.log('Sending create rol request to authentication service');
    try {
      const response: RolResponse = await sendKafkaRequest(
        this.kafkaClient.send('authentication.roles.create_rol', rolData),
      );

      return new ApiResponse(
        `Role created successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('update-rol/:rolId')
  @ApiOperation({
    summary: 'Update an existing role',
    description: 'Updates an existing role in the authentication service.',
  })
  async updateRol(
    @Param('rolId', ParseIntPipe) rolId: number,
    @Body() rolData: UpdateRolRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    this.logger.log('Sending update rol request to authentication service');
    try {
      const payload = { rolId, rolData };
      const response: RolResponse = await sendKafkaRequest(
        this.kafkaClient.send('authentication.roles.update_rol', payload),
      );

      return new ApiResponse(
        `Role with ID ${rolId} updated successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-rol-by-id/:rolId')
  @ApiOperation({
    summary: 'Get role by ID',
    description: 'Retrieves a role by its ID from the authentication service.',
  })
  async getRolById(
    @Param('rolId', ParseIntPipe) rolId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    this.logger.log('Sending get rol by ID request to authentication service');
    try {
      const response: RolResponse = await sendKafkaRequest(
        this.kafkaClient.send('authentication.roles.get_rol_by_id', rolId),
      );

      return new ApiResponse(
        `Role with ID ${rolId} retrieved successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-all-rols')
  @ApiOperation({
    summary: 'Get all roles',
    description: 'Retrieves all roles from the authentication service.',
  })
  async getAllRols(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    this.logger.log('Sending get all rols request to authentication service');
    try {
      const payload = { limit, offset };
      const response: RolResponse[] = await sendKafkaRequest(
        this.kafkaClient.send('authentication.roles.get_all_rols', {
          limit,
          offset,
        }),
      );

      return new ApiResponse(
        `Roles retrieved successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
