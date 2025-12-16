import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'crypto';

export class UpdateWorkOrderObservationRequest {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The ID of the work order',
    type: String,
  })
  workOrderId: UUID;
  @ApiProperty({
    example: 'Updated observation description.',
    description: 'The description of the observation',
    type: String,
  })
  description: string;
  @ApiProperty({
    example: 10,
    description: 'The ID of the worker updating the observation',
    type: Number,
  })
  workerId: number;

  constructor(workOrderId: UUID, description: string, workerId: number) {
    this.workOrderId = workOrderId;
    this.description = description;
    this.workerId = workerId;
  }
}
