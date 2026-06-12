import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddWorkerToWorkOrderRequest {
  @ApiProperty({
    example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
    description: 'UUID de la orden de trabajo',
  })
  workOrderId!: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del usuario/trabajador a agregar',
  })
  workerId!: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID del rol (1=Técnico Responsable, 2=Técnico Operativo, 3=Supervisor GIS). Opcional.',
  })
  roleId?: number | null;

  @ApiPropertyOptional({
    example: true,
    description: 'TRUE = técnico responsable de la OT (solo 1 por orden). FALSE = trabajador de campo adicional.',
  })
  isResponsible?: boolean;

  @ApiProperty({
    example: 'b2c3d4e5-f6a7-4b6c-9d8e-1f2a3b4c5d6e',
    description: 'UUID del usuario que realiza la asignación (administrador)',
  })
  assignedByUserId!: string;
}
