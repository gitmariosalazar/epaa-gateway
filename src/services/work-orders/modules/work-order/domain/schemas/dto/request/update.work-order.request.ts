import { ApiProperty } from "@nestjs/swagger";

export class UpdateWorkOrderRequest {
  @ApiProperty({
    description: 'A brief description of the work order',
    example: 'Fix leaking pipe in apartment 3B',
  })
  description: string;
  @ApiProperty({
    required: false,
    description: 'The date when the work order was created',
    example: '2023-10-01T10:00:00Z',
  })
  creationDate?: Date;
  @ApiProperty({
    required: false,
    description: 'The date when the work order was assigned',
    example: '2023-10-02T10:00:00Z',
  })
  asignationDate?: Date;
  @ApiProperty({
    required: false,
    description: 'The date when the work order was started',
    example: '2023-10-03T10:00:00Z',
  })
  startDate?: Date;
  @ApiProperty({
    required: false,
    description: 'The date when the work order was completed',
    example: '2023-10-04T10:00:00Z',
  })
  completionDate?: Date;
  @ApiProperty({
    required: false,
    description: 'The date when the work order was canceled',
    example: '2023-10-05T10:00:00Z',
  })
  cancelationDate?: Date;
  @ApiProperty({
    description: 'The type identifier of the work order',
    example: 2,
  })
  workOrderTypeId: number;
  @ApiProperty({
    description: 'The priority identifier of the work order',
    example: 1,
  })
  priorityId: number;
  @ApiProperty({
    description: 'The status identifier of the work order',
    example: 3,
  })
  workOrderStatusId: number;
  @ApiProperty({
    description: 'The connection identifier related to the work order',
    example: 'conn-12345',
  })
  connectionId: string;
  @ApiProperty({
    required: false,
    description: 'The client identifier associated with the work order',
    example: 'client-67890',
  })
  clientId?: string;
  @ApiProperty({
    description: 'The user identifier who created the work order',
    example: 'user-abcde',
  })
  createdUserId: string;
  @ApiProperty({
    required: false,
    description: 'The user identifier who was assigned the work order',
    example: 'user-fghij',
  })
  assignedUserId?: string;
  @ApiProperty({
    required: false,
    description: 'The estimated cost of the work order',
    example: 150.75,
  })
  estimateCost?: number;
  @ApiProperty({
    required: false,
    description: 'The real cost of the work order',
    example: 145.50,
  })
  realCost?: number;
  @ApiProperty({
    required: false,
    description: 'Additional observations related to the work order',
    example: 'The pipe was replaced successfully',
  })
  observations?: string;
  constructor(
    description: string,
    workOrderTypeId: number,
    priorityId: number,
    workOrderStatusId: number,
    connectionId: string,
    createdUserId: string,
    creationDate?: Date,
    asignationDate?: Date,
    startDate?: Date,
    completionDate?: Date,
    cancelationDate?: Date,
    clientId?: string,
    assignedUserId?: string,
    estimateCost?: number,
    realCost?: number,
    observations?: string,
  ) {
    this.description = description;
    this.workOrderTypeId = workOrderTypeId;
    this.priorityId = priorityId;
    this.workOrderStatusId = workOrderStatusId;
    this.connectionId = connectionId;
    this.createdUserId = createdUserId;
    if (creationDate) this.creationDate = creationDate;
    if (asignationDate) this.asignationDate = asignationDate;
    if (startDate) this.startDate
    this.startDate = startDate;;
    if (completionDate) this.completionDate = completionDate;
    if (cancelationDate) this.cancelationDate = cancelationDate;
    if (clientId) this.clientId = clientId;
    if (assignedUserId) this.assignedUserId = assignedUserId;
    if (estimateCost) this.estimateCost = estimateCost;
    if (realCost) this.realCost = realCost;
    if (observations) this.observations = observations;
  }
}