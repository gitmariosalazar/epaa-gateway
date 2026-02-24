import {
  Body,
  Controller,
  Inject,
  OnModuleInit,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiOperation } from '@nestjs/swagger';
import { AuthRequest } from '../../domain/schemas/dto/request/auth.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthResponse } from '../../domain/schemas/dto/response/auth.response';
import { Response } from 'express';
import { parseExpirationToSeconds } from '../../../../../../shared/utils/jwt/time.util';

@Controller('auth')
export class AuthGatewayController implements OnModuleInit {
  constructor(
    @Inject(environments.GATEWAY_AUTH_KAFKA_CLIENT)
    private readonly authKafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const requestPatterns = [
      'authentication.auth.signin',
      'authentication.auth.signup',
    ];

    requestPatterns.forEach((pattern) => {
      this.authKafkaClient.subscribeToResponseOf(pattern);
    });

    await this.authKafkaClient.connect();
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
      const kafkaResponse: AuthResponse = await sendKafkaRequest(
        this.authKafkaClient.send('authentication.auth.signin', payload),
      );

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
            parseExpirationToSeconds(environments.JWT_ACCESS_EXPIRATION) * 1000, //environments.JWT_ACCESS_TOKEN_EXPIRES_IN * 1000, // Convertir a milisegundos
        });
      }

      return new ApiResponse(
        'Sign In successfully!',
        kafkaResponse,
        request.url,
      );
    } catch (error) {
      throw error;
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
  @ApiOperation({
    summary: 'Sign out user',
    description: 'Endpoint to sign out a user',
  })
  async signOut(
    @Res({ passthrough: true }) res: Response,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true, // environments.COOKIE_SECURE,
        sameSite: 'none', //environments.COOKIE_SAME_SITE,
        maxAge: 0,
      });

      return new ApiResponse('Sign Out successfully!', null, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
