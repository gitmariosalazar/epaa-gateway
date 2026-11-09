import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorador para restringir el acceso a rutas según uno o más IDs de permisos numéricos.
 * La comprobación utiliza un OR lógico: el usuario debe tener al menos uno de los permisos indicados.
 *
 * @example
 * @Permissions(88) // Requiere permiso 88 (ot:dashboard_ejecutivo)
 * @Permissions(88, 89) // Requiere permiso 88 (ejecutivo) O 89 (operativo)
 */
export const Permissions = (...permissions: number[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
