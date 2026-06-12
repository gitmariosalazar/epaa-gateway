import { ApiProperty } from '@nestjs/swagger';

export class ResolvePreparationInspectionRequest {
  @ApiProperty({
    example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
    description: 'Work order ID',
  })
  workOrderId!: string;

  @ApiProperty({
    example: 'b2c3d4e5-f6a7-4b6c-9d8e-1f2a3b4c5d6e',
    description: 'User ID',
  })
  userId!: string;

  @ApiProperty({
    example: true,
    description: 'Whether preparation inspection passed',
  })
  passed!: boolean;

  @ApiProperty({
    example: 'Ready to start field execution.',
    required: false,
    description: 'Optional comment',
  })
  comment?: string;
}
