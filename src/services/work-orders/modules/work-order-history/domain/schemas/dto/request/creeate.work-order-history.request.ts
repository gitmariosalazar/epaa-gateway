import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkHistoryRequest {
  @ApiProperty({
    description: 'ID of the work order',
    example: 123,
    type: Number,
    required: true,
  })
  workOrderId: number;
  @ApiProperty({
    description: 'ID of the new status',
    example: 2,
    type: Number,
    required: false,
  })
  statusId?: number;
  @ApiProperty({
    description: 'Date of the change',
    example: '2024-01-01T12:00:00Z',
    type: String,
    required: false,
  })
  changeDate?: Date;
  @ApiProperty({
    description: 'ID of the user making the change',
    example: 45,
    type: Number,
    required: true,
  })
  userId: number;
  @ApiProperty({
    description: 'Description of the change',
    example: 'Changed status to In Progress',
    type: String,
    required: false,
  })
  changeDescription?: string;
  @ApiProperty({
    description: 'Cadastral key associated with the work order',
    example: 'ABC123',
    type: String,
    required: false,
  })
  cadastralKey?: string;
  @ApiProperty({
    description: 'Order code associated with the work order',
    example: 'ORD456',
    type: String,
    required: false,
  })
  orderCode?: string;

  constructor(
    workOrderId: number,
    userId: number,
    statusId?: number,
    changeDate?: Date,
    changeDescription?: string,
    cadastralKey?: string,
    orderCode?: string,
  ) {
    this.workOrderId = workOrderId;
    this.statusId = statusId;
    this.changeDate = changeDate || new Date();
    this.userId = userId;
    this.changeDescription = changeDescription;
    this.cadastralKey = cadastralKey;
    this.orderCode = orderCode;
  }
}
