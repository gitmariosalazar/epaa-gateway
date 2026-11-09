import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorador para restringir el acceso a rutas según uno o más roles.
 * La comprobación utiliza un OR lógico: el usuario debe tener al menos uno de los roles indicados.
 *
 * @example
 * @Roles('SUPER ADMINISTRADOR', 'SUPERVISOR DE OPERACIONES Y CUADRILLAS')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
