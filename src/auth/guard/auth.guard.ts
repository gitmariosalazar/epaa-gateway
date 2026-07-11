import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { statusCode } from '../../settings/environments/status-code';
import { environments } from '../../settings/environments/environments';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
import { REQUIRE_APP_KEY } from '../decorator/require-app-key.decorator';
import {
  API_KEY_VALIDATOR,
  IApiKeyValidator,
} from '../interfaces/api-key-validator.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    @Inject(API_KEY_VALIDATOR)
    private readonly apiKeyValidator: IApiKeyValidator,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handlers = [context.getHandler(), context.getClass()];

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      handlers,
    );
    const requiresAppKey = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_APP_KEY,
      handlers,
    );

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    // ── No JWT token present ────────────────────────────────────────────────
    if (!token) {
      if (isPublic) return true;

      if (requiresAppKey) {
        return this.assertAppKey(request);
      }

      throw new RpcException({
        statusCode: statusCode.UNAUTHORIZED,
        message: 'Authorization token is missing or malformed!',
      });
    }

    // ── JWT token present → verify it ───────────────────────────────────────
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: environments.JWT_ACCESS_TOKEN_SECRET,
      });

      const allowedUserTypes = this.reflector.getAllAndOverride<string[]>(
        'user_types',
        handlers,
      );

      // For @RequireAppKey() endpoints no explicit user-type restriction is
      // assumed when none is declared: any authenticated user type is valid.
      if (!requiresAppKey || allowedUserTypes) {
        const userTypes = allowedUserTypes || ['employee'];
        const userType: string = payload.user_type || 'employee';

        if (!userTypes.includes(userType)) {
          throw new RpcException({
            statusCode: statusCode.FORBIDDEN,
            message:
              'You do not have the required permissions to access this resource!',
          });
        }
      }

      request['user'] = payload;
      request['auth_token'] = token;
      return true;
    } catch (error) {
      if (isPublic) return true;

      // JWT failed on a @RequireAppKey() endpoint → fall back to API key
      if (requiresAppKey) {
        return this.assertAppKey(request);
      }

      this.logger.error(
        'Error verifying token in the gateway!',
        error instanceof Error ? error.stack : error,
      );

      if (error instanceof RpcException) throw error;

      throw new RpcException({
        statusCode: statusCode.UNAUTHORIZED,
        message: 'Token is not valid or has expired!',
      });
    }
  }

  /**
   * Validates the `x-api-key` header for endpoints decorated with
   * @RequireAppKey(). Throws HTTP 401 when the key is absent or invalid.
   */
  private assertAppKey(request: Request): boolean {
    const providedKey = request.headers['x-api-key'];

    if (
      typeof providedKey !== 'string' ||
      !this.apiKeyValidator.isValid(providedKey)
    ) {
      throw new RpcException({
        statusCode: statusCode.UNAUTHORIZED,
        message:
          'Access denied: a valid x-api-key header is required for unauthenticated requests to this endpoint.',
      });
    }

    return true;
  }

  /**
   * Soporte para token en Authorization header y en cookies.
   */
  private extractToken(request: Request): string | undefined {
    //Buscar en cookie primero
    const cookieToken = request.cookies?.['auth_token'];
    if (cookieToken) return cookieToken;

    // Buscar en header Authorization
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
