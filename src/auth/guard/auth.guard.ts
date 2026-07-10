import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { statusCode } from '../../settings/environments/status-code';
import { environments } from '../../settings/environments/environments';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractToken(request);

    //this.logger.log('Token received in the gateway!');
    //console.log(token);

    if (!token) {
      throw new RpcException({
        statusCode: statusCode.UNAUTHORIZED,
        message: 'Authorization token is missing or malformed!',
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: environments.JWT_ACCESS_TOKEN_SECRET,
      });

      //this.logger.log('Payload verified in the gateway!');
      //console.log('Payload:', payload);
      // Read user types metadata using Reflector
      const allowedUserTypes = this.reflector.getAllAndOverride<string[]>(
        'user_types',
        [context.getHandler(), context.getClass()],
      );

      //console.log('Allowed user types for this endpoint:', allowedUserTypes);

      // Retrocompatibility/Defensive: Default to 'employee' if no explicit allowed user types are defined on the endpoint
      const userTypes = allowedUserTypes || ['employee'];

      const userType = payload.user_type || 'employee';

      if (!userTypes.includes(userType)) {
        throw new RpcException({
          statusCode: statusCode.FORBIDDEN,
          message:
            'You do not have the required permissions to access this resource!',
        });
      }

      request['user'] = payload; // Attach user payload to request
      request['auth_token'] = token;
      return true;
    } catch (error) {
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
