import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';

export class AdditionalCostItemRequest {
  @ApiProperty({ example: 'Costo por transporte extra', description: 'Concept' })
  @IsString()
  @IsNotEmpty()
  concept!: string;

  @ApiProperty({ example: 2, description: 'Quantity' })
  @IsNumber()
  @IsNotEmpty()
  quantity!: number;

  @ApiProperty({ example: 15.5, description: 'Unit cost' })
  @IsNumber()
  @IsNotEmpty()
  unitCost!: number;
}

export class AddAdditionalCostsBatchRequest {
  @ApiProperty({
    example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
    description: 'Work order ID',
  })
  @IsString()
  @IsNotEmpty()
  workOrderId!: string;

  @ApiProperty({
    example: 'b2c3d4e5-f6a7-4b6c-9d8e-1f2a3b4c5d6e',
    description: 'User who created the records',
  })
  @IsString()
  @IsNotEmpty()
  createdByUserId!: string;

  @ApiProperty({
    type: () => [AdditionalCostItemRequest],
    description: 'List of costs to add (minimum 1 item)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalCostItemRequest)
  costs!: AdditionalCostItemRequest[];
}
