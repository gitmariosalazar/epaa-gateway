import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class WorkOrderMaterialItemRequest {
  @ApiProperty({ example: 502, description: 'Material ID' })
  @IsNumber()
  @IsNotEmpty()
  materialId!: number;

  @ApiProperty({ example: 3, description: 'Quantity' })
  @IsNumber()
  @IsNotEmpty()
  quantity!: number;

  @ApiProperty({ example: 14.2, description: 'Unit cost' })
  @IsNumber()
  @IsNotEmpty()
  unitCost!: number;
  @ApiProperty({ example: 'MAT-001', description: 'Material code' })
  @IsString()
  @IsNotEmpty()
  codigoMaterial!: string;

  @ApiProperty({ example: 'Tubería PVC 1/2"', description: 'Material name' })
  @IsString()
  @IsNotEmpty()
  nombreMaterial!: string;
}

export class AddWorkOrderMaterialsBatchRequest {
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
    type: () => [WorkOrderMaterialItemRequest],
    description: 'List of materials to add (minimum 1 item)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkOrderMaterialItemRequest)
  materials!: WorkOrderMaterialItemRequest[];
}
