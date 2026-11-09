import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';
import { Request } from 'express';
import { PERMISSIONS_KEY } from '../decorator/permissions.decorator';
import { statusCode } from '../../settings/environments/status-code';
import { AccessTokenPayload } from '../../shared/utils/interfaces/user.payload';
import { PermissionsInvalidationService } from '../services/permissions-invalidation.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Optional()
    private readonly invalidationService?: PermissionsInvalidationService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<number[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si la ruta o clase no define permisos numéricos requeridos, se permite el acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as unknown as { user?: AccessTokenPayload }).user;

    if (!user) {
      throw new RpcException({
        statusCode: statusCode.FORBIDDEN,
        message: 'No posee los permisos necesarios para acceder a este recurso.',
      });
    }

    // Bypass automático para SUPER ADMINISTRADOR
    const rawRoles: unknown = user.roles;
    if (Array.isArray(rawRoles)) {
      const isSuperAdmin = rawRoles.some((r) => {
        if (typeof r === 'string') {
          return r.toUpperCase().includes('SUPER ADMINISTRADOR');
        }
        if (typeof r === 'object' && r !== null) {
          const roleObj = r as Record<string, unknown>;
          const nameVal =
            roleObj.name ?? roleObj.nombre ?? roleObj.role ?? roleObj.rol;
          return (
            typeof nameVal === 'string' &&
            nameVal.toUpperCase().includes('SUPER ADMINISTRADOR')
          );
        }
        return false;
      });

      if (isSuperAdmin) {
        return true;
      }
    } else if (
      typeof rawRoles === 'string' &&
      rawRoles.toUpperCase().includes('SUPER ADMINISTRADOR')
    ) {
      return true;
    }

    // Verificar si los permisos del token están desactualizados tras una revocación
    const userId = user.sub || (user as unknown as { userId?: string }).userId;
    const tokenIat = (user as unknown as { iat?: number }).iat;

    if (
      this.invalidationService &&
      userId &&
      this.invalidationService.isTokenStale(userId, tokenIat)
    ) {
      this.logger.warn(
        `Token del usuario [${userId}] contiene claims de permisos desactualizados (stale). Forzando renovación.`,
      );
      throw new RpcException({
        statusCode: statusCode.FORBIDDEN,
        message: 'Permisos de usuario desactualizados. Renueve su sesión.',
      });
    }

    const rawPermissions: unknown = user.permissions;
    const userPermissions = new Set<number>();

    if (Array.isArray(rawPermissions)) {
      for (const p of rawPermissions) {
        if (typeof p === 'object' && p !== null) {
          const permObj = p as Record<string, unknown>;
          const num = Number(
            permObj.id ?? permObj.permiso_id ?? permObj.permission_id,
          );
          if (!isNaN(num)) {
            userPermissions.add(num);
          }
        } else {
          const num = Number(p);
          if (!isNaN(num)) {
            userPermissions.add(num);
          }
        }
      }
    }

    // Comprobación con OR lógico: el usuario debe tener al menos uno de los permisos requeridos
    const hasPermission = requiredPermissions.some((permId) =>
      userPermissions.has(Number(permId)),
    );

    if (!hasPermission) {
      this.logger.warn(
        `Acceso denegado a usuario [${user.username || user.sub}]. Permisos del usuario: [${Array.from(
          userPermissions,
        ).join(', ')}]. Permisos requeridos: [${requiredPermissions.join(', ')}]`,
      );
      throw new RpcException({
        statusCode: statusCode.FORBIDDEN,
        message: 'Acceso denegado. Permisos insuficientes para esta operación.',
      });
    }

    return true;
  }
}
