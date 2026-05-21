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
import { VerifyUserRequest } from '../../domain/schemas/dto/request/verify-user.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthResponse } from '../../domain/schemas/dto/response/auth.response';
import { VerifyUserResponse } from '../../domain/schemas/dto/response/verify-user.response';
import { Response, Request as ExpressRequest } from 'express';
import { parseExpirationToSeconds } from '../../../../../../shared/utils/jwt/time.util';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';

@Controller('auth')
export class AuthGatewayController {
  private readonly logger = new Logger(AuthGatewayController.name);
  constructor(
    @Inject(environments.GATEWAY_AUTH_KAFKA_CLIENT)
    private readonly authKafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

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
          maxAge: parseExpirationToSeconds(environments.JWT_ACCESS_EXPIRATION), //environments.JWT_ACCESS_TOKEN_EXPIRES_IN * 1000, // Convertir a milisegundos
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
      const user = request['user'];

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
