import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { Request } from 'express';
import { statusCode } from '../../settings/environments/status-code';
import { environments } from '../../settings/environments/environments';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

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

      request['user'] = payload; // Attach user payload to request
      request['auth_token'] = token;
      return true;
    } catch (error) {
      this.logger.error('Error verifying token in the gateway!', error.message);

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
