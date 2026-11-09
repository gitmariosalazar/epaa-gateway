import { AccessTokenPayload } from '../../../shared/utils/interfaces/user.payload';

export interface UserParams {
  id?: string;
  sub?: string;
  role?: string | Record<string, unknown>;
  roles?: Array<string | Record<string, unknown>>;
  permissions?: number[];
  user_type?: string;
  username?: string;
  email?: string;
}

/**
 * Extrae y normaliza los parámetros de usuario a partir del token JWT contenido en la solicitud HTTP.
 * Garantiza tipos limpios y consistentes para su envío a través de los mensajes de Kafka hacia los microservicios.
 */
export function extractUserParams(request: unknown): UserParams | undefined {
  if (!request || typeof request !== 'object') {
    return undefined;
  }

  const reqWithUser = request as { user?: AccessTokenPayload };
  const authUser = reqWithUser.user;

  if (!authUser) {
    return undefined;
  }

  const rawRoles: unknown = authUser.roles;
  const normalizedRoles: string[] = [];
  if (Array.isArray(rawRoles)) {
    for (const r of rawRoles) {
      if (typeof r === 'string' && r.trim().length > 0) {
        normalizedRoles.push(r.trim());
      } else if (typeof r === 'object' && r !== null) {
        const roleObj = r as Record<string, unknown>;
        const nameVal =
          roleObj.name ?? roleObj.nombre ?? roleObj.role ?? roleObj.rol;
        if (typeof nameVal === 'string' && nameVal.trim().length > 0) {
          normalizedRoles.push(nameVal.trim());
        }
      }
    }
  } else if (typeof rawRoles === 'string' && rawRoles.trim().length > 0) {
    normalizedRoles.push(rawRoles.trim());
  }

  const rawPermissions: unknown = authUser.permissions;
  const normalizedPermissions: number[] = [];
  if (Array.isArray(rawPermissions)) {
    for (const p of rawPermissions) {
      const num = Number(p);
      if (!isNaN(num)) {
        normalizedPermissions.push(num);
      }
    }
  }

  const sub = authUser.sub;
  return sub
    ? {
        id: String(sub),
        sub: String(sub),
        roles: normalizedRoles,
        role: normalizedRoles[0],
        permissions: normalizedPermissions,
        user_type: authUser.user_type,
        username: authUser.username,
        email: authUser.email,
      }
    : undefined;
}
