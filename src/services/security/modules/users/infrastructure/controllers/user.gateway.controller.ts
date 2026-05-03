import { ClientKafka } from '@nestjs/microservices/client/client-kafka';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
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
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { CreateUserRequest } from '../../domain/schemas/dto/request/create.user.request';
import { RpcException } from '@nestjs/microservices';
import { ChangePasswordUserRequest } from '../../domain/schemas/dto/request/change-password.user.request';
import { UpdateUserRequest } from '../../domain/schemas/dto/request/update.user.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import {
  UserResponse,
  UserResponseWithPermissionsResponse,
  UserResponseWithRolesAndPermissionsResponse,
  UserResponseWithRolesResponse,
} from '../../domain/schemas/dto/response/user.response';
import {
  AssignRoleToUserRequest,
  RemoveRoleFromUserRequest,
} from '../../domain/schemas/dto/request/assign-role-to-user.request';
import {
  AssignPermissionToUserRequest,
  RemovePermissionFromUserRequest,
} from '../../domain/schemas/dto/request/assign-permission-to-user.request';

@Controller('users-gateway')
@ApiTags('Users-Gateway')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class UserGatewayController implements OnModuleInit {
  private readonly logger = new Logger(UserGatewayController.name);
  constructor(
    @Inject(environments.GATEWAY_USERS_KAFKA_CLIENT)
    private readonly clientKafka: ClientKafka,
  ) {}

  onModuleInit() {
    const requestPatterns = [
      'authentication.user.find_by_id',
      'authentication.user.find_by_username_or_email',
      'authentication.user.create_user',
      'authentication.user.increment_failed_attempts',
      'authentication.user.reset_failed_attempts',
      'authentication.user.soft_delete',
      'authentication.user.restore',
      'authentication.user.update_user',
      'authentication.user.update_password',
      'authentication.user.verify_credentials',
      'authentication.user.find_by_refresh_token',
      'authentication.user.exists_by_username_or_email',
      'authentication.user.exists_by_username',
      'authentication.user.exists_by_email',
      'authentication.user.find_by_username',
      'authentication.user.find_by_email',
      'authentication.user.find_all',
      'authentication.user.get_profile',
      'authentication.user.assign_role_to_user',
      'authentication.user.remove_role_from_user',
      'authentication.user.exists_role_in_user',
      'authentication.user.get_users_by_role_id',
      'authentication.user.get_roles_by_user_id',
      'authentication.user.assign_permission_to_user',
      'authentication.user.remove_permission_from_user',
      'authentication.user.exists_permission_in_user',
      'authentication.user.get_permissions_by_user_id',
      'authentication.user.get_users_by_permission_id',
    ];

    requestPatterns.forEach((pattern) => {
      this.clientKafka.subscribeToResponseOf(pattern);
    });

    return this.clientKafka.connect();
  }

  @Post('create-user')
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user in the authentication service.',
  })
  async createUser(
    @Body() userData: CreateUserRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponse = await sendKafkaRequest(
        this.clientKafka.send('authentication.user.create_user', userData),
      );

      return new ApiResponse(
        'User created successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error creating user: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Get('find-by-username-or-email')
  @ApiOperation({
    summary: 'Find user by username or email',
    description:
      'Retrieves a user from the authentication service by username or email.',
  })
  async findByUsernameOrEmail(
    @Query('username') username: string,
    @Query('email') email: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponseWithRolesAndPermissionsResponse =
        await sendKafkaRequest(
          this.clientKafka.send(
            'authentication.user.find_by_username_or_email',
            {
              username,
              email,
            },
          ),
        );

      return new ApiResponse(
        'User retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error finding user by username or email: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Put('update-user/:userId')
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates an existing user in the authentication service.',
  })
  async updateUser(
    @Param('userId') userId: string,
    @Body() updates: UpdateUserRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponse = await sendKafkaRequest(
        this.clientKafka.send('authentication.user.update_user', {
          userId,
          updates,
        }),
      );

      return new ApiResponse(
        'User updated successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error updating user: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Get('find-by-id/:userId')
  @ApiOperation({
    summary: 'Find user by ID',
    description: 'Retrieves a user from the authentication service by ID.',
  })
  async findById(
    @Param('userId') userId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponse = await sendKafkaRequest(
        this.clientKafka.send('authentication.user.find_by_id', userId),
      );

      return new ApiResponse(
        'User retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error finding user by ID: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Get('exists-by-username-or-email')
  @ApiOperation({
    summary: 'Check if user exists by username or email',
    description:
      'Checks if a user exists in the authentication service by username or email.',
  })
  async existsByUsernameOrEmail(
    @Query('username') username: string,
    @Query('email') email: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: boolean = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user.exists_by_username_or_email',
          { username, email },
        ),
      );

      return new ApiResponse(
        'User existence checked successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error checking user existence by username or email: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('exists-by-username/:username')
  @ApiOperation({
    summary: 'Check if user exists by username',
    description:
      'Checks if a user exists in the authentication service by username.',
  })
  async existsByUsername(
    @Param('username') username: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: boolean = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user.exists_by_username',
          username,
        ),
      );

      return new ApiResponse(
        'User existence checked successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error checking user existence by username: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('exists-by-email/:email')
  @ApiOperation({
    summary: 'Check if user exists by email',
    description:
      'Checks if a user exists in the authentication service by email.',
  })
  async existsByEmail(
    @Param('email') email: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: boolean = await sendKafkaRequest(
        this.clientKafka.send('authentication.user.exists_by_email', email),
      );

      return new ApiResponse(
        'User existence checked successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error checking user existence by email: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('find-by-username/:username')
  @ApiOperation({
    summary: 'Find user by username',
    description:
      'Retrieves a user from the authentication service by username.',
  })
  async findByUsername(
    @Param('username') username: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponse = await sendKafkaRequest(
        this.clientKafka.send('authentication.user.find_by_username', username),
      );

      return new ApiResponse(
        'User retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error finding user by username: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
  @Get('find-by-email/:email')
  @ApiOperation({
    summary: 'Find user by email',
    description: 'Retrieves a user from the authentication service by email.',
  })
  async findByEmail(
    @Param('email') email: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponse = await sendKafkaRequest(
        this.clientKafka.send('authentication.user.find_by_email', email),
      );

      return new ApiResponse(
        'User retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error finding user by email: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Put('update-password/:userId')
  @ApiOperation({
    summary: 'Update user password',
    description:
      'Updates the password of an existing user in the authentication service.',
  })
  async updatePassword(
    @Param('userId') userId: string,
    @Body()
    changePassword: ChangePasswordUserRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponse = await sendKafkaRequest(
        this.clientKafka.send('authentication.user.update_password', {
          userId,
          changePassword,
        }),
      );

      return new ApiResponse(
        'User password updated successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error updating user password: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('find-by-refresh-token')
  @ApiOperation({
    summary: 'Find user by refresh token',
    description:
      'Retrieves a user from the authentication service by refresh token.',
  })
  async findByRefreshToken(
    @Query('token') token: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponse = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user.find_by_refresh_token',
          token,
        ),
      );

      return new ApiResponse(
        'User retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error finding user by refresh token: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Delete('soft-delete/:userId')
  @ApiOperation({
    summary: 'Soft delete user',
    description: 'Soft deletes a user in the authentication service.',
  })
  async softDelete(
    @Param('userId') userId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: void = await sendKafkaRequest(
        this.clientKafka.send('authentication.user.soft_delete', userId),
      );

      return new ApiResponse(
        'User soft deleted successfully',
        null,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error soft deleting user: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Put('restore/:userId')
  @ApiOperation({
    summary: 'Restore user',
    description: 'Restores a soft-deleted user in the authentication service.',
  })
  async restore(
    @Param('userId') userId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponse = await sendKafkaRequest(
        this.clientKafka.send('authentication.user.restore', userId),
      );

      return new ApiResponse(
        'User restored successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error restoring user: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Put('increment-failed-attempts/:userId')
  @ApiOperation({
    summary: 'Increment failed login attempts',
    description:
      'Increments the failed login attempts counter for a user in the authentication service.',
  })
  async incrementFailedAttempts(
    @Param('userId') userId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: void = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user.increment_failed_attempts',
          userId,
        ),
      );

      return new ApiResponse(
        'Failed login attempts incremented successfully',
        null,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error incrementing failed login attempts: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Put('reset-failed-attempts/:userId')
  @ApiOperation({
    summary: 'Reset failed login attempts',
    description:
      'Resets the failed login attempts counter for a user in the authentication service.',
  })
  async resetFailedAttempts(
    @Param('userId') userId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: void = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user.reset_failed_attempts',
          userId,
        ),
      );

      return new ApiResponse(
        'Failed login attempts reset successfully',
        null,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error resetting failed login attempts: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('verify-credentials')
  @ApiOperation({
    summary: 'Verify user credentials',
    description: 'Verifies user credentials in the authentication service.',
  })
  async verifyCredentials(
    @Query('username') username: string,
    @Query('password') password: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponse = await sendKafkaRequest(
        this.clientKafka.send('authentication.user.verify_credentials', {
          username,
          password,
        }),
      );

      return new ApiResponse(
        'User credentials verified successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error verifying user credentials: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('find-all')
  @ApiOperation({
    summary: 'Find all users',
    description: 'Retrieves all users from the authentication service.',
  })
  async findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponseWithRolesAndPermissionsResponse =
        await sendKafkaRequest(
          this.clientKafka.send('authentication.user.find_all', {
            limit,
            offset,
          }),
        );

      return new ApiResponse(
        'Users retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error finding all users: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-profile/:usernameOrEmail')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieves a user profile from the authentication service.',
  })
  async getProfile(
    @Param('usernameOrEmail') usernameOrEmail: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponseWithRolesAndPermissionsResponse =
        await sendKafkaRequest(
          this.clientKafka.send(
            'authentication.user.get_profile',
            usernameOrEmail,
          ),
        );

      const { passwordHash, ...user } = response;

      return new ApiResponse(
        'User profile retrieved successfully',
        user,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving user profile: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('assign-role-to-user')
  @ApiOperation({
    summary: 'Assign role to user',
    description: 'Assigns a role to a user in the authentication service.',
  })
  async assignRoleToUser(
    @Body() assignRoleToUserRequest: AssignRoleToUserRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: void = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user.assign_role_to_user',
          assignRoleToUserRequest,
        ),
      );

      return new ApiResponse(
        'Role assigned to user successfully',
        null,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error assigning role to user: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('assign-permission-to-user')
  @ApiOperation({
    summary: 'Assign permission to user',
    description:
      'Assigns a permission to a user in the authentication service.',
  })
  async assignPermissionToUser(
    @Body() assignPermissionToUserRequest: AssignPermissionToUserRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: void = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user.assign_permission_to_user',
          assignPermissionToUserRequest,
        ),
      );

      return new ApiResponse(
        'Permission assigned to user successfully',
        null,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error assigning permission to user: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Delete('remove-role-from-user/:userId/:roleId')
  @ApiOperation({
    summary: 'Remove role from user',
    description: 'Removes a role from a user in the authentication service.',
  })
  async removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId', ParseIntPipe) roleId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const removeRoleFromUserRequest: RemoveRoleFromUserRequest =
        new RemoveRoleFromUserRequest(userId, roleId);
      const response: void = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user.remove_role_from_user',
          removeRoleFromUserRequest,
        ),
      );

      return new ApiResponse(
        'Role removed from user successfully',
        null,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error removing role from user: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Delete('remove-permission-from-user/:userId/:permissionId')
  @ApiOperation({
    summary: 'Remove permission from user',
    description:
      'Removes a permission from a user in the authentication service.',
  })
  async removePermissionFromUser(
    @Param('userId') userId: string,
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const removePermissionFromUserRequest: RemovePermissionFromUserRequest =
        new RemovePermissionFromUserRequest(userId, permissionId);
      const response: void = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user.remove_permission_from_user',
          removePermissionFromUserRequest,
        ),
      );

      return new ApiResponse(
        'Permission removed from user successfully',
        null,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error removing permission from user: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-roles-by-user/:userId')
  @ApiOperation({
    summary: 'Get roles by user',
    description: 'Retrieves roles by user in the authentication service.',
  })
  async getRolesByUser(
    @Param('userId') userId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponseWithRolesResponse[] = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user.get_roles_by_user_id',
          userId,
        ),
      );

      return new ApiResponse(
        'Roles retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving roles by user: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-permissions-by-user/:userId')
  @ApiOperation({
    summary: 'Get permissions by user',
    description: 'Retrieves permissions by user in the authentication service.',
  })
  async getPermissionsByUser(
    @Param('userId') userId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponseWithPermissionsResponse[] =
        await sendKafkaRequest(
          this.clientKafka.send(
            'authentication.user.get_permissions_by_user_id',
            userId,
          ),
        );

      return new ApiResponse(
        'Permissions retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving permissions by user: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-users-by-permission/:permissionId')
  @ApiOperation({
    summary: 'Get users by permission',
    description: 'Retrieves users by permission in the authentication service.',
  })
  async getUsersByPermission(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponse[] = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user.get_users_by_permission_id',
          permissionId,
        ),
      );

      return new ApiResponse(
        'Users retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving users by permission: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-users-by-role/:roleId')
  @ApiOperation({
    summary: 'Get users by role',
    description: 'Retrieves users by role in the authentication service.',
  })
  async getUsersByRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserResponse[] = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user.get_users_by_role_id',
          roleId,
        ),
      );

      return new ApiResponse(
        'Users retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving users by role: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
