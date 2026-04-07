import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogSessionRequest {
  @ApiPropertyOptional({
    description: 'ID del usuario (opcional si es intento fallido anónimo)',
  })
  userId?: string;

  @ApiPropertyOptional({ description: 'Username ingresado en el login' })
  username?: string;

  @ApiProperty({
    description: 'Tipo de evento de la sesión',
    enum: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED'],
  })
  event: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | undefined;

  @ApiPropertyOptional({
    description: 'Dirección IP desde la que se intentó loguear',
  })
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User-Agent (dispositivo o navegador)' })
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Motivo del fallo si aplica (ej. Credenciales inválidas)',
  })
  failedReason?: string;

  @ApiPropertyOptional({
    description: 'Metadatos en formato JSON libre',
    type: Object,
  })
  metadata?: Record<string, any>;
}
