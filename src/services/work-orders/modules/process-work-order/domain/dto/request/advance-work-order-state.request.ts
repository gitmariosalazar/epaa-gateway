import { ApiProperty } from '@nestjs/swagger';

/**
 * AdvanceWorkOrderStateRequest — DTO para el endpoint POST /advance-state
 *
 * SRP: representa exactamente los datos necesarios para avanzar una OT a cualquier estado.
 * OCP: nuevos estados no requieren cambios aquí — newStatus acepta cualquier string.
 *      La validación de la transición la hace fn_validar_transicion_estado en PostgreSQL.
 */
export class AdvanceWorkOrderStateRequest {
  @ApiProperty({
    example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
    description: 'UUID de la orden de trabajo a avanzar',
  })
  workOrderId!: string;

  @ApiProperty({
    example: 'ASIGNADA',
    description:
      'Código del nuevo estado. Debe ser una transición válida desde el estado actual. ' +
      'Ejemplos: PENDIENTE, ASIGNADA, PREPARACION, EN_PROCESO, EJECUTADA, COMPLETADA, ' +
      'NOTIFICADA_INSPECCION, EN_PROCESO_INSPECCION, INSPECCION_COMPLETADA, ' +
      'NOTIFICADA_INSTALACION, EN_PROCESO_INSTALACION, INSTALACION_COMPLETADA, CANCELADA.',
  })
  newStatus!: string;

  @ApiProperty({
    example: 'b2c3d4e5-f6a7-4b6c-9d8e-1f2a3b4c5d6e',
    description: 'UUID del usuario autenticado que realiza la acción',
  })
  userId!: string;

  @ApiProperty({
    example: 'Avance manual desde panel de detalle.',
    required: false,
    description: 'Comentario opcional (obligatorio si newStatus = CANCELADA)',
  })
  comment?: string;
}
