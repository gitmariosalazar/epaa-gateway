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
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
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
export class RolGatewayController {
  private readonly logger = new Logger(RolGatewayController.name);

  constructor(
    @Inject(environments.GATEWAY_ROLES_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  
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
        this.kafkaProxy.send(this.kafkaClient, 'authentication.roles.create_rol', rolData),
      );

      return new ApiResponse(
        `Role created successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error creating role: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'authentication.roles.update_rol', payload),
      );

      return new ApiResponse(
        `Role with ID ${rolId} updated successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error updating role: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'authentication.roles.get_rol_by_id', rolId),
      );

      return new ApiResponse(
        `Role with ID ${rolId} retrieved successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error getting role by ID: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'authentication.roles.get_all_rols', payload),
      );

      return new ApiResponse(
        `Roles retrieved successfully.`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error getting all roles: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }
}
