import { ApiProperty } from '@nestjs/swagger';

export class AssignWorkOrderToCrewRequest {
  @ApiProperty({
    example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
    description: 'Work order ID',
  })
  workOrderId!: string;

  @ApiProperty({
    example: 'f5a6b7c8-d9e0-4b1c-2d3e-4f5a6b7c8d9e',
    description: 'Crew ID',
  })
  crewId!: string;

  @ApiProperty({
    example: 'USUARIO_ADMIN_UUID',
    description: 'Assigning user ID',
  })
  assignedByUserId!: string;

  @ApiProperty({
    example: 'Assigned to Operations crew 01',
    required: false,
    description: 'Optional comment',
  })
  comment?: string;
}
