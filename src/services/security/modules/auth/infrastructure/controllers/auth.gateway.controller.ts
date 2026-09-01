import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiOperation } from '@nestjs/swagger';
import { AuthRequest } from '../../domain/schemas/dto/request/auth.request';
import { ClientAuthRequest } from '../../domain/schemas/dto/request/client-auth.request';
import { VerifyUserRequest } from '../../domain/schemas/dto/request/verify-user.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthResponse } from '../../domain/schemas/dto/response/auth.response';
import { VerifyUserResponse } from '../../domain/schemas/dto/response/verify-user.response';
import { Response, Request as ExpressRequest } from 'express';
import { parseExpirationToSeconds } from '../../../../../../shared/utils/jwt/time.util';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { AllowedUserTypes } from '../../../../../../auth/decorator/allowed-user-types.decorator';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { AccessTokenPayload } from '../../../../../../shared/utils/interfaces/user.payload';

import { UnlockModuleRequest } from '../../domain/schemas/dto/request/unlock-module.request';
import { SetPinRequest } from '../../domain/schemas/dto/request/set-pin.request';

@Controller('auth')
export class AuthGatewayController {
  private readonly logger = new Logger(AuthGatewayController.name);
  constructor(
    @Inject(environments.GATEWAY_AUTH_KAFKA_CLIENT)
    private readonly authKafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Post('unlock-module')
  @UseGuards(AuthGuard)
  @AllowedUserTypes('employee')
  @ApiOperation({
    summary: 'Unlock special module (Session Upgrade)',
    description: 'Endpoint to elevate user privileges with a security PIN',
  })
  async unlockModule(
    @Req() request: ExpressRequest,
    @Body() payload: UnlockModuleRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Unlocking module for user: ${payload.userId}`);
      const kafkaResponse: { elevated_token: string } = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.authKafkaClient,
          'authentication.auth.unlock-module',
          payload,
        ),
      );

      const isBrowser =
        request.headers['user-agent']?.includes('Mozilla') ?? false;

      if (isBrowser && kafkaResponse.elevated_token) {
        // Update the cookie with the newly elevated token
        res.cookie('auth_token', kafkaResponse.elevated_token, {
          httpOnly: true,
          secure: false, // environments.COOKIE_SECURE,
          sameSite: 'lax', //environments.COOKIE_SAME_SITE,
          path: '/',
          maxAge:
            parseExpirationToSeconds(environments.JWT_ACCESS_EXPIRATION) * 1000,
        });
      }

      return new ApiResponse(
        'Module unlocked successfully!',
        kafkaResponse,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error unlocking module: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Post('set-pin')
  @UseGuards(AuthGuard)
  @AllowedUserTypes('employee')
  @ApiOperation({
    summary: 'Set or update security PIN',
    description: 'Endpoint to configure a security PIN for the authenticated user, or for another user if you have admin privileges.',
  })
  async setPin(
    @Req() request: ExpressRequest,
    @Body() payload: SetPinRequest,
  ): Promise<ApiResponse> {
    try {
      const user: AccessTokenPayload = request['user'] as AccessTokenPayload;
      let targetUserId = user.sub;

      if (payload.userId && payload.userId !== user.sub) {
        const isAdmin = user.roles?.some(
          (role) => role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrador'
        );

        if (!isAdmin) {
          throw new RpcException({
            statusCode: 403,
            message: 'You do not have the required privileges to set a PIN for another user.',
          });
        }
        targetUserId = payload.userId;
      }

      this.logger.log(`Setting PIN for user: ${targetUserId} (Requested by: ${user.sub})`);
      
      const kafkaResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.authKafkaClient,
          'authentication.user.set_pin',
          { userId: targetUserId, pin: payload.pin },
        ),
      );

      return new ApiResponse(
        'PIN configured successfully!',
        kafkaResponse,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error setting PIN: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Post('signin')
  @ApiOperation({
    summary: 'Sign in user',
    description: 'Endpoint to sign in a user',
  })
  async signIn(
    @Req() request: Request,
    @Body() payload: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Signing in user: ${payload.username_or_email} - ${payload.password ? 'with password' : 'without password'}`,
      );
      const kafkaResponse: AuthResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.authKafkaClient,
          'authentication.auth.signin',
          payload,
        ),
      );

      // Defensa: si el microservicio devuelve null (usuario no encontrado,
      // timeout interno, etc.) lanzamos 401 explícito en vez de un TypeError.
      if (!kafkaResponse) {
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid credentials. Please try again!',
        });
      }

      const isBrowser =
        request.headers['user-agent']?.includes('Mozilla') ?? false;

      if (isBrowser && kafkaResponse.accessToken) {
        // Configurar la cookie solo si la solicitud proviene de un navegador
        res.cookie('auth_token', kafkaResponse.accessToken, {
          httpOnly: true,
          secure: false, // environments.COOKIE_SECURE,
          sameSite: 'lax', //environments.COOKIE_SAME_SITE,
          path: '/',
          maxAge:
            parseExpirationToSeconds(environments.JWT_ACCESS_EXPIRATION) * 1000, // Convertir segundos a milisegundos
        });
      }

      return new ApiResponse(
        'Sign In successfully!',
        kafkaResponse,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error signing in: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Post('client/signin')
  @ApiOperation({
    summary: 'Sign in client/customer',
    description: 'Endpoint to sign in a customer/client',
  })
  async clientSignIn(
    @Req() request: ExpressRequest,
    @Body() payload: ClientAuthRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Signing in customer: ${payload.username_or_email}`);
      const kafkaResponse: AuthResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.authKafkaClient,
          'authentication.auth.client.signin',
          payload,
        ),
      );

      if (!kafkaResponse) {
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid credentials. Please try again!',
        });
      }

      const isBrowser =
        request.headers['user-agent']?.includes('Mozilla') ?? false;

      if (isBrowser && kafkaResponse.accessToken) {
        res.cookie('auth_token', kafkaResponse.accessToken, {
          httpOnly: true,
          secure: false, // environments.COOKIE_SECURE
          sameSite: 'lax',
          path: '/',
          maxAge:
            parseExpirationToSeconds(environments.JWT_ACCESS_EXPIRATION) * 1000,
        });
      }

      return new ApiResponse(
        'Sign In successfully!',
        kafkaResponse,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error signing in customer: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Post('signup')
  @ApiOperation({
    summary: 'Sign up user',
    description: 'Endpoint to sign up a new user',
  })
  async signUp() {
    return { message: 'Sign up endpoint' };
  }

  @Post('signout')
  @UseGuards(AuthGuard)
  @AllowedUserTypes('employee', 'customer')
  @ApiOperation({
    summary: 'Sign out user',
    description: 'Endpoint to sign out a user',
  })
  async signOut(
    @Res({ passthrough: true }) res: Response,
    @Req() request: ExpressRequest,
    @Body() payload: { refreshToken?: string },
  ): Promise<ApiResponse> {
    try {
      const user: AccessTokenPayload = request['user'] as AccessTokenPayload;

      // Notificar al microservicio para invalidar tokens y auditar LOGOUT
      if (user?.sub) {
        await sendKafkaRequest(
          this.kafkaProxy.send(
            this.authKafkaClient,
            'authentication.auth.signout',
            {
              userId: user.sub,
              refreshToken: payload?.refreshToken,
            },
          ),
        );
      }

      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true, // environments.COOKIE_SECURE,
        sameSite: 'none', //environments.COOKIE_SAME_SITE,
        maxAge: 0,
      });

      return new ApiResponse('Sign Out successfully!', null, request.url);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error signing out: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Endpoint to get a new access token using a refresh token',
  })
  async refresh(
    @Req() request: ExpressRequest,
    @Body() payload: { refreshToken: string },
  ): Promise<ApiResponse> {
    try {
      const kafkaResponse: AuthResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.authKafkaClient,
          'authentication.auth.refresh',
          payload,
        ),
      );

      return new ApiResponse(
        'Token refreshed successfully!',
        kafkaResponse,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error refreshing token: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Post('verify')
  @ApiOperation({
    summary: 'Verify user existence',
    description:
      'Checks whether a user with the given username or email exists in the system before proceeding with login',
  })
  async verifyUser(
    @Req() request: ExpressRequest,
    @Body() payload: VerifyUserRequest,
  ): Promise<ApiResponse> {
    try {
      const kafkaResponse: VerifyUserResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.authKafkaClient,
          'authentication.auth.verify',
          payload,
        ),
      );

      return new ApiResponse(
        'User verified successfully!',
        kafkaResponse,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error verifying user: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }
}
