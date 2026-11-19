import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChangeConnectionStateRequest {
  @ApiProperty({
    example: '14-293',
    description: 'ID de la acometida',
  })
  connectionId!: string;

  @ApiProperty({
    example: 14,
    description: 'ID del nuevo estado (1 a 15)',
  })
  newStateId!: number;

  // Se extrae automáticamente del JWT (request.user.sub)
  userId?: string;

  @ApiProperty({
    example: 'Corte por mora de 3 planillas vencidas',
    description: 'Motivo del cambio de estado',
  })
  motivo!: string;

  @ApiPropertyOptional({
    description: 'Detalles técnicos u observaciones adicionales',
  })
  detallesTecnicos?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Archivo de evidencia (Foto del corte, precinto, medidor o PDF de respaldo)',
  })
  file?: unknown;
}

export class BulkChangeConnectionStateRequest {
  @ApiProperty({
    example: ['14-293', '10-114'],
    description: 'Lista de IDs de acometidas a cambiar',
  })
  connectionIds!: string[];

  @ApiProperty({
    example: 3,
    description: 'ID del nuevo estado',
  })
  newStateId!: number;

  // Se extrae automáticamente del JWT (request.user.sub)
  userId?: string;

  @ApiProperty({
    example: 'Campaña masiva de corte',
    description: 'Motivo del cambio en bloque',
  })
  motivo!: string;
}
