import { ApiProperty } from '@nestjs/swagger';

export class RegisterSatisfactionSurveyRequest {
  @ApiProperty({
    example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
    description: 'Work order ID',
  })
  workOrderId!: string;

  @ApiProperty({ example: 5, description: 'Rating from 1 to 5' })
  rating!: number;

  @ApiProperty({
    example: 'e3400d18-86e1-4eee-9a8b-3e7eaf812a95',
    description: 'Customer ID',
  })
  createdByUserId!: string;

  @ApiProperty({
    example: 'Fast repair and clean finish.',
    required: false,
    description: 'Optional comments',
  })
  comments?: string;
}
