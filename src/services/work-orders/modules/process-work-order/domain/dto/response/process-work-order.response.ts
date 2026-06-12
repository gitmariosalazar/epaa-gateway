import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessWorkOrderResponse {
  @ApiProperty({ example: 'create_work_order', description: 'Action name' })
  action!: string;

  @ApiProperty({ example: '2', description: 'Record identifier' })
  recordId!: string;

  @ApiProperty({
    example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
    description: 'Work order ID',
  })
  workOrderId!: string;

  @ApiPropertyOptional({
    example: 'OT-2026-0000101',
    description: 'Order code',
  })
  orderCode?: string;

  @ApiPropertyOptional({
    example: 'PENDIENTE',
    description: 'Previous status code',
  })
  previousStatus?: string;

  @ApiPropertyOptional({
    example: 'Pendiente Asignación',
    description: 'Previous status name',
  })
  previousStatusName?: string;

  @ApiPropertyOptional({ example: 'ASIGNADA', description: 'New status code' })
  newStatus?: string;

  @ApiPropertyOptional({ example: 'Asignada', description: 'New status name' })
  newStatusName?: string;

  @ApiPropertyOptional({
    example: 'ASIGNADA',
    description: 'Current status code',
  })
  currentStatus?: string;

  @ApiPropertyOptional({
    example: 'Asignada',
    description: 'Current status name',
  })
  currentStatusName?: string;

  @ApiProperty({
    example: 'e3400d18-86e1-4eee-9a8b-3e7eaf812a95',
    description: 'User who created the action',
  })
  createdByUserId!: string;

  @ApiPropertyOptional({
    example: 'e3400d18-86e1-4eee-9a8b-3e7eaf812a95',
    description: 'Processed by user ID',
  })
  processedByUserId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Approval flag when applicable',
  })
  approved?: boolean;

  @ApiPropertyOptional({
    example: 'Checklist complete',
    description: 'Optional comment',
  })
  comment?: string;

  @ApiProperty({
    example: '2026-06-05T10:00:00.000Z',
    description: 'Processed timestamp',
  })
  processedAt!: Date;

  @ApiPropertyOptional({
    example: { crewId: '...' },
    description: 'Extra metadata',
  })
  metadata?: Record<string, string | number | boolean | null>;
}
