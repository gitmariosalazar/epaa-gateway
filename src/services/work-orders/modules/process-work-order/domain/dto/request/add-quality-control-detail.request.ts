import { ApiProperty } from '@nestjs/swagger';

export class AddQualityControlDetailRequest {
  @ApiProperty({
    example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
    description: 'Work order ID',
  })
  workOrderId!: string;

  @ApiProperty({
    example: '8e3f2d2a-7b6a-4f22-8f1a-c0f9c6b1f001',
    description: 'Control ID',
  })
  controlId!: string;

  @ApiProperty({
    example: 'PRUEBA_PRESION',
    description: 'Quality checklist item code',
  })
  code!: string;

  @ApiProperty({ example: true, description: 'Whether the item passed' })
  passed!: boolean;

  @ApiProperty({
    example: 'Pressure test passed.',
    required: false,
    description: 'Optional comment',
  })
  comment?: string;

  @ApiProperty({
    example: 'd4e5f6a7-b8c9-4d8e-1f0a-3b4c5d6e7f8a',
    description: 'User who created the detail',
  })
  createdByUserId!: string;
}
