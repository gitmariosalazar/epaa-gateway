import { ApiProperty } from '@nestjs/swagger';

export class AddPreparationInspectionDetailRequest {
  @ApiProperty({
    example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
    description: 'Work order ID',
  })
  workOrderId!: string;

  @ApiProperty({
    example: '8e3f2d2a-7b6a-4f22-8f1a-c0f9c6b1f001',
    description: 'Inspection ID',
  })
  inspectionId!: string;

  @ApiProperty({ example: 'EPP_COMPLETO', description: 'Checklist item code' })
  code!: string;

  @ApiProperty({ example: true, description: 'Whether the item passed' })
  passed!: boolean;

  @ApiProperty({
    example: 'Item available in the vehicle.',
    required: false,
    description: 'Optional comment',
  })
  comment?: string;

  @ApiProperty({
    example: 'b2c3d4e5-f6a7-4b6c-9d8e-1f2a3b4c5d6e',
    description: 'User who created the detail',
  })
  createdByUserId!: string;
}
