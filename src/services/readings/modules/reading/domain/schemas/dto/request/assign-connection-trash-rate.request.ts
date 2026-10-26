import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AssignConnectionTrashRateRequest {
  @ApiProperty({
    example: '22-492',
    description: 'Connection identifier / Cadastral key',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  connectionId!: string;

  @ApiProperty({
    example: '0200236479001',
    description: 'Identification number (Cedula or RUC) of the client',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  clientId!: string;

  @ApiProperty({
    example: 'RESIDENCIAL',
    description: 'Category name (e.g., RESIDENCIAL, COMERCIAL, INDUSTRIAL)',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  categoryName!: string;

  @ApiPropertyOptional({
    example: 25,
    description: 'Consumption in cubic meters (m3) for tiered rate calculation',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  consumptionM3?: number;

  @ApiPropertyOptional({
    example: 'TARIFA_NUEVA_ACOMETIDA',
    description: 'Origin reason for the assignment',
    enum: [
      'EMELNORTE_DISTRIBUCION',
      'TARIFA_NUEVA_ACOMETIDA',
      'TARIFA_REACTIVACION_ACOMETIDA',
      'TARIFA_SIN_EMELNORTE',
      'AJUSTE_MANUAL',
    ],
    default: 'TARIFA_NUEVA_ACOMETIDA',
  })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({
    example: 'PLIEGO-2026-V1',
    description: 'Rate schedule version sheet',
  })
  @IsOptional()
  @IsString()
  versionSheet?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether to persist the assignment in the database (default: false)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  persist?: boolean;
}
