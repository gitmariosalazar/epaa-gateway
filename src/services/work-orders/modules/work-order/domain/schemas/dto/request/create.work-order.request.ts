import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkOrderRequest {
  @ApiProperty({
    example: 'WO-12345',
    description: 'Unique code for the work order',
    type: String,
    required: true,
  })
  orderCode: string;
  @ApiProperty({
    example: 2,
    description: 'ID of the work order type',
    type: Number,
    required: true,
  })
  workTypeId: number;
  @ApiProperty({
    example: 3,
    description: 'ID of the priority level',
    type: Number,
    required: true,
  })
  priorityId: number;
  @ApiProperty({
    example: 'client-789',
    description: 'ID of the client associated with the work order',
    type: String,
    required: false,
  })
  clientId?: string;
  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
    description: 'Date when the work order was created',
    type: Date,
    required: false,
  })
  creationDate?: Date;
  @ApiProperty({
    example: '2024-01-16T10:00:00Z',
    description: 'Date when the work order was assigned',
    type: Date,
    required: false,
  })
  assignationDate?: Date;
  @ApiProperty({
    example: '2024-01-20T10:00:00Z',
    description: 'Date when the work order was completed',
    type: Date,
    required: false,
  })
  completionDate?: Date;
  @ApiProperty({
    example: 1,
    description: 'Status of the work order',
    type: Number,
    required: false,
  })
  status?: number;
  @ApiProperty({
    example: 'Fix the leaking pipe in the basement.',
    description: 'Detailed description of the work order',
    type: String,
    required: true,
  })
  description: string;
  @ApiProperty({
    example: '123 Main St, Springfield',
    description: 'Location where the work order is to be performed',
    type: String,
    required: true,
  })
  location: string;
  @ApiProperty({
    example: 1,
    description: 'ID of the user who created the work order',
    type: Number,
    required: true,
  })
  createdUserId: number;
  @ApiProperty({
    example: 1,
    description: 'ID of the user assigned to the work order',
    type: Number,
    required: false,
  })
  assignedUserId?: number;
  @ApiProperty({
    example: 1,
    description: 'ID of the user who completed the work order',
    type: Number,
    required: false,
  })
  completedUserId?: number;
  @ApiProperty({
    example: '40.7128° N, 74.0060° W',
    description: 'Geographical coordinates for the work order location',
    type: String,
    required: false,
  })
  coordinates?: string;
  @ApiProperty({
    example: '{"key":"value"}',
    description: 'Additional metadata for the work order in JSON format',
    type: String,
    required: false,
  })
  metadata?: string;
  @ApiProperty({
    example: 'ABC123XYZ',
    description: 'Cadastral key associated with the work order location',
    type: String,
    required: false,
  })
  cadastralKey?: string;
  constructor(
    orderCode: string,
    workTypeId: number,
    priorityId: number,
    description: string,
    location: string,
    createdUserId: number,
    clientId?: string,
    creationDate?: Date,
    assignationDate?: Date,
    completionDate?: Date,
    status?: number,
    assignedUserId?: number,
    completedUserId?: number,
    coordinates?: string,
    metadata?: string,
    cadastralKey?: string,
  ) {
    this.orderCode = orderCode;
    this.workTypeId = workTypeId;
    this.priorityId = priorityId;
    this.description = description;
    this.location = location;
    this.createdUserId = createdUserId;
    if (clientId !== undefined) {
      this.clientId = clientId;
    }
    if (creationDate !== undefined) {
      this.creationDate = creationDate;
    }
    if (assignationDate !== undefined) {
      this.assignationDate = assignationDate;
    }
    if (completionDate !== undefined) {
      this.completionDate = completionDate;
    }
    if (status !== undefined) {
      this.status = status;
    }
    if (assignedUserId !== undefined) {
      this.assignedUserId = assignedUserId;
    }
    if (completedUserId !== undefined) {
      this.completedUserId = completedUserId;
    }
    if (coordinates !== undefined) {
      this.coordinates = coordinates;
    }
    if (metadata !== undefined) {
      this.metadata = metadata;
    }
    if (cadastralKey !== undefined) {
      this.cadastralKey = cadastralKey;
    }
  }
}
