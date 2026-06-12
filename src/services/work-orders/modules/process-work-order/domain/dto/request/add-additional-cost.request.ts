import { ApiProperty } from '@nestjs/swagger';

export class AddAdditionalCostRequest {
  @ApiProperty({
    example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
    description: 'Work order ID',
  })
  workOrderId!: string;

  @ApiProperty({
    example: 'Use of hydro-vac truck',
    description: 'Additional cost concept',
  })
  concept!: string;

  @ApiProperty({ example: 2, description: 'Quantity' })
  quantity!: number;

  @ApiProperty({ example: 60, description: 'Unit cost' })
  unitCost!: number;

  @ApiProperty({
    example: 'b2c3d4e5-f6a7-4b6c-9d8e-1f2a3b4c5d6e',
    description: 'User who created the record',
  })
  createdByUserId!: string;
}
