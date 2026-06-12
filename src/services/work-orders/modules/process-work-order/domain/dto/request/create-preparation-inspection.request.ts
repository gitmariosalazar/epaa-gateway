import { ApiProperty } from '@nestjs/swagger';

export class CreatePreparationInspectionRequest {
  @ApiProperty({
    example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
    description: 'Work order ID',
  })
  workOrderId!: string;

  @ApiProperty({
    example: 'f5a6b7c8-d9e0-4b1c-2d3e-4f5a6b7c8d9e',
    required: false,
    description: 'Crew ID if applicable',
  })
  crewId?: string;

  @ApiProperty({
    example: 'b2c3d4e5-f6a7-4b6c-9d8e-1f2a3b4c5d6e',
    description: 'User who created the inspection',
  })
  createdByUserId!: string;

  @ApiProperty({ example: true, description: 'Inspection result' })
  passed!: boolean;

  @ApiProperty({
    example: 'All safety gear available.',
    required: false,
    description: 'Optional observations',
  })
  observations?: string;
}
