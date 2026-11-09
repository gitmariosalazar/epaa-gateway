import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';
import { Request } from 'express';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { statusCode } from '../../settings/environments/status-code';
import { AccessTokenPayload } from '../../shared/utils/interfaces/user.payload';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si la ruta o clase no define roles requeridos, se permite el acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as unknown as { user?: AccessTokenPayload }).user;

    if (!user || !user.roles) {
      throw new RpcException({
        statusCode: statusCode.FORBIDDEN,
        message: 'No posee los roles necesarios para acceder a este recurso.',
      });
    }

    const rawRoles: unknown = user.roles;
    const userRoles: string[] = [];

    if (Array.isArray(rawRoles)) {
      for (const r of rawRoles) {
        if (typeof r === 'string' && r.trim().length > 0) {
          userRoles.push(r.trim().toUpperCase());
        } else if (typeof r === 'object' && r !== null) {
          const roleObj = r as Record<string, unknown>;
          const nameVal =
            roleObj.name ?? roleObj.nombre ?? roleObj.role ?? roleObj.rol;
          if (typeof nameVal === 'string' && nameVal.trim().length > 0) {
            userRoles.push(nameVal.trim().toUpperCase());
          }
        }
      }
    } else if (typeof rawRoles === 'string' && rawRoles.trim().length > 0) {
      userRoles.push(rawRoles.trim().toUpperCase());
    }

    // Bypass automático para SUPER ADMINISTRADOR
    if (userRoles.some((r) => r.includes('SUPER ADMINISTRADOR'))) {
      return true;
    }

    const normalizedRequired = requiredRoles.map((r) => r.trim().toUpperCase());
    const hasRole = userRoles.some((role) =>
      normalizedRequired.some((req) => role === req || role.includes(req)),
    );

    if (!hasRole) {
      this.logger.warn(
        `Acceso denegado a usuario [${user.username || user.sub}]. Roles: [${userRoles.join(
          ', ',
        )}]. Requeridos: [${normalizedRequired.join(', ')}]`,
      );
      throw new RpcException({
        statusCode: statusCode.FORBIDDEN,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
      });
    }

    return true;
  }
}
