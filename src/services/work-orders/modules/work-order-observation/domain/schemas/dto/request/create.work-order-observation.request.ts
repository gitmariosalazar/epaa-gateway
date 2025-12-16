import { ApiProperty } from '@nestjs/swagger';
import { randomUUID, UUID } from 'crypto';

export class CreateWorkOrderObservationRequest {
  @ApiProperty({
    example: randomUUID(),
    description: 'The ID of the work order',
    type: String,
  })
  workOrderId: UUID;
  @ApiProperty({
    example: 'Observed a leak in the pipe.',
    description: 'The description of the observation',
    type: String,
  })
  description: string;
  @ApiProperty({
    example: 5,
    description: 'The ID of the worker making the observation',
    type: Number,
  })
  workerId: number;

  constructor(workOrderId: UUID, description: string, workerId: number) {
    this.workOrderId = workOrderId;
    this.description = description;
    this.workerId = workerId;
  }
}
