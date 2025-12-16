import { ApiProperty } from '@nestjs/swagger';

export class CreateDetailWorkOrderMaterialRequest {
  @ApiProperty({
    example: 'WO-12345',
    description: 'The ID of the work order',
    type: String,
    required: true,
  })
  workOrderId: string;
  @ApiProperty({
    example: 1,
    description: 'The ID of the material',
    type: Number,
    required: true,
  })
  materialId: number;
  @ApiProperty({
    example: 10,
    description: 'The quantity of the material',
    type: Number,
    required: true,
  })
  quantity: number;
  @ApiProperty({
    example: 15.5,
    description: 'The unit cost of the material',
    type: Number,
    required: true,
  })
  unitCost: number;

  constructor(
    workOrderId: string,
    materialId: number,
    quantity: number,
    unitCost: number,
  ) {
    this.workOrderId = workOrderId;
    this.materialId = materialId;
    this.quantity = quantity;
    this.unitCost = unitCost;
  }
}
