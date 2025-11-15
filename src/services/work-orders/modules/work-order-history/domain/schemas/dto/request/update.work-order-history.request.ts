import { ApiProperty } from "@nestjs/swagger";

export class UpdateWorkOrderHistoryRequest {
  @ApiProperty(
    { example: 1, description: 'ID of the work order associated with this history record', type: Number, required: false },
  )
  workOrderId?: number;
  @ApiProperty(
    { example: '2023-10-01T12:00:00Z', description: 'Date and time when the change occurred', type: Date, required: false },
  )
  changeDate?: Date;
  @ApiProperty(
    { example: 2, description: 'Previous status ID of the work order', type: Number, required: false },
  )
  previousStatusId?: number;
  @ApiProperty(
    { example: 3, description: 'New status ID of the work order', type: Number, required: false },
  )
  newStatusId?: number;
  @ApiProperty(
    { example: 42, description: 'ID of the user who made the change', type: Number, required: false },
  )
  userId?: number;
  @ApiProperty(
    { example: 'Changed status from pending to completed', description: 'Description of the change', type: String, required: false },
  )
  changeDescription?: string;

  constructor(
    workOrderId?: number,
    changeDate?: Date,
    userId?: number,
    previousStatusId?: number,
    newStatusId?: number,
    changeDescription?: string,
  ) {
    if (workOrderId) this.workOrderId = workOrderId;
    if (changeDate) this.changeDate = changeDate;
    if (userId) this.userId = userId;
    if (previousStatusId) this.previousStatusId = previousStatusId;
    if (newStatusId) this.newStatusId = newStatusId;
    if (changeDescription) this.changeDescription = changeDescription;
  }
}