import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PermissionsInvalidationService {
  private readonly logger = new Logger(PermissionsInvalidationService.name);
  private readonly userInvalidations = new Map<string, number>();
  private globalInvalidationTimestamp: number = 0;

  /**
   * Invalida los tokens emitidos previamente para un usuario específico.
   * Cualquier petición posterior con un token con iat anterior será forzada a renovarse.
   */
  invalidateUser(userId: string): void {
    if (!userId) return;
    const now = Date.now();
    this.userInvalidations.set(userId, now);
    this.logger.log(`Usuario [${userId}] invalidado para permisos a las ${new Date(now).toISOString()}`);
  }

  /**
   * Invalida globalmente tokens cuando se modifican roles o permisos a nivel de rol.
   */
  invalidateAll(): void {
    const now = Date.now();
    this.globalInvalidationTimestamp = now;
    this.logger.log(`Invalidación global de permisos emitida a las ${new Date(now).toISOString()}`);
  }

  /**
   * Determina si el token JWT enviado es "stale" (sus claims de permisos son anteriores
   * a la última revocación o modificación en base de datos).
   */
  isTokenStale(userId: string, tokenIatSeconds?: number): boolean {
    if (!tokenIatSeconds) return false;
    const tokenIssuedAtMs = tokenIatSeconds * 1000;

    // Verificar invalidación global (ej. cambios en un rol)
    if (this.globalInvalidationTimestamp > 0 && tokenIssuedAtMs < this.globalInvalidationTimestamp - 1000) {
      return true;
    }

    // Verificar invalidación específica de usuario
    if (userId) {
      const userInvalidatedAt = this.userInvalidations.get(userId);
      if (userInvalidatedAt && tokenIssuedAtMs < userInvalidatedAt - 1000) {
        return true;
      }
    }

    return false;
  }
}
