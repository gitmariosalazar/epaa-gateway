import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAuditLogsRequest {
  @ApiPropertyOptional({ description: 'Límite de registros', default: 100 })
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset para paginación', default: 0 })
  offset?: number;

  @ApiPropertyOptional({ description: 'Filtro por nombre de tabla afectada' })
  tableName?: string;

  @ApiPropertyOptional({
    description: 'Filtro por tipo de operación DML',
    enum: ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE'],
  })
  operation?: 'INSERT' | 'UPDATE' | 'DELETE' | 'TRUNCATE';

  @ApiPropertyOptional({
    description: 'Filtro por ID de usuario que ejecutó la acción',
  })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filtro por nombre de usuario que ejecutó la acción',
  })
  username?: string;
}

export class GetSessionLogsRequest {
  @ApiPropertyOptional({ description: 'Límite de registros', default: 100 })
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset para paginación', default: 0 })
  offset?: number;

  @ApiPropertyOptional({ description: 'Filtro por ID de usuario' })
  userId?: string;

  @ApiPropertyOptional({ description: 'Filtro por nombre de usuario' })
  username?: string;

  @ApiPropertyOptional({
    description: 'Filtro por evento de sesión',
    enum: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED'],
  })
  event?: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED';
}
