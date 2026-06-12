import { ApiProperty } from '@nestjs/swagger';

export class ResolveQualityControlRequest {
  @ApiProperty({
    example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
    description: 'Work order ID',
  })
  workOrderId!: string;

  @ApiProperty({
    example: 'd4e5f6a7-b8c9-4d8e-1f0a-3b4c5d6e7f8a',
    description: 'User ID',
  })
  userId!: string;

  @ApiProperty({
    example: true,
    description: 'Whether quality control approved the work',
  })
  approved!: boolean;

  @ApiProperty({
    example: 'No leaks detected.',
    required: false,
    description: 'Optional comment',
  })
  comment?: string;
}
