import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { CreateRolPermissionRequest } from '../../domain/schemas/dto/request/create.rol-permission.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { RolPermissionResponse } from '../../domain/schemas/dto/response/rol-permission.response';

@Controller('rol-permission')
@ApiTags('Rol-Permission')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class RolPermissionGatewayController implements OnModuleInit {
  constructor(
    @Inject(environments.GATEWAY_ROL_PERMISSION_KAFKA_CLIENT)
    private readonly clientKafka: ClientKafka,
  ) {}

  async onModuleInit() {
    const requestPatterns = [
      'authentication.rol_permission.create_rol_permission',
      'authentication.rol_permission.delete_rol_permission',
      'authentication.rol_permission.update_rol_permission',
      'authentication.rol_permission.get_rol_permission_by_id',
      'authentication.rol_permission.get_all_rol_permissions',
      'authentication.rol_permission.verify_rol_permission_exists',
    ];

    requestPatterns.forEach((pattern) => {
      this.clientKafka.subscribeToResponseOf(pattern);
    });

    await this.clientKafka.connect();
  }

  @Post('create-rol-permission')
  @ApiOperation({
    summary: 'Create Rol-Permission',
    description:
      'Create a new rol-permission by sending a request to the authentication service via Kafka.',
  })
  async createRolPermissionGateway(
    @Req() request: Request,
    @Body() rolPermission: CreateRolPermissionRequest,
  ): Promise<ApiResponse> {
    try {
      const response: RolPermissionResponse = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.rol_permission.create_rol_permission',
          rolPermission,
        ),
      );

      return new ApiResponse(
        'Rol-Permission created successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('update-rol-permission/:rolPermissionId')
  @ApiOperation({
    summary: 'Update Rol-Permission',
    description:
      'Update an existing rol-permission by sending a request to the authentication service via Kafka.',
  })
  async updateRolPermissionGateway(
    @Req() request: Request,
    @Body() rolPermission: CreateRolPermissionRequest,
    @Param('rolPermissionId', ParseIntPipe) rolPermissionId: number,
  ): Promise<ApiResponse> {
    try {
      const response: RolPermissionResponse = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.rol_permission.update_rol_permission',
          {
            rolPermissionId,
            rolPermission,
          },
        ),
      );

      return new ApiResponse(
        'Rol-Permission updated successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete('delete-rol-permission/:rolPermissionId')
  @ApiOperation({
    summary: 'Delete Rol-Permission',
    description:
      'Delete an existing rol-permission by sending a request to the authentication service via Kafka.',
  })
  async deleteRolPermissionGateway(
    @Req() request: Request,
    @Param('rolPermissionId', ParseIntPipe) rolPermissionId: number,
  ): Promise<ApiResponse> {
    try {
      const response: boolean = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.rol_permission.delete_rol_permission',
          rolPermissionId,
        ),
      );

      return new ApiResponse(
        'Rol-Permission deleted successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-rol-permission/:rolPermissionId')
  @ApiOperation({
    summary: 'Get Rol-Permission by ID',
    description:
      'Retrieve a rol-permission by its ID by sending a request to the authentication service via Kafka.',
  })
  async getRolPermissionByIdGateway(
    @Req() request: Request,
    @Param('rolPermissionId', ParseIntPipe) rolPermissionId: number,
  ): Promise<ApiResponse> {
    try {
      const response: RolPermissionResponse = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.rol_permission.get_rol_permission_by_id',
          rolPermissionId,
        ),
      );

      return new ApiResponse(
        'Rol-Permission retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-all-rol-permissions')
  @ApiOperation({
    summary: 'Get All Rol-Permissions',
    description:
      'Retrieve all rol-permissions by sending a request to the authentication service via Kafka.',
  })
  async getAllRolPermissionsGateway(
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: RolPermissionResponse[] = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.rol_permission.get_all_rol_permissions',
          { limit: 100, offset: 0 },
        ),
      );

      return new ApiResponse(
        'Rol-Permissions retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('verify-rol-permission-exists/:rolId/:permissionId')
  @ApiOperation({
    summary: 'Verify Rol-Permission Exists',
    description:
      'Verify if a rol-permission exists by sending a request to the authentication service via Kafka.',
  })
  async verifyRolPermissionExistsGateway(
    @Req() request: Request,
    @Param('rolId', ParseIntPipe) rolId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ): Promise<ApiResponse> {
    try {
      const response: boolean = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.rol_permission.verify_rol_permission_exists',
          { rolId, permissionId },
        ),
      );

      return new ApiResponse(
        'Rol-Permission existence verified successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
