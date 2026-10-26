import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ApplyPaymentAgreementRequest {
  @ApiProperty({
    example: 'CONV-2026-0001',
    description: 'Unique code or contract number for the payment agreement',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  agreementCode!: string;

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
    description: 'Identification number (Cedula/RUC) of the client',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  clientId!: string;

  @ApiProperty({
    example: [101, 102, 103],
    description: 'Array of reading / invoice IDs included in the agreement',
    type: [Number],
    required: true,
  })
  @IsArray()
  @IsInt({ each: true })
  readingIds!: number[];

  @ApiProperty({
    example: 6,
    description: 'Number of installments agreed (must be >= 1)',
    required: true,
  })
  @IsInt()
  @Min(1)
  numberOfInstallments!: number;

  @ApiPropertyOptional({
    example: 120.5,
    description: 'Total refinanced amount across the invoices',
  })
  @IsOptional()
  @IsNumber()
  totalRefinancedAmount?: number;

  @ApiPropertyOptional({
    example: 'Convenio de pago por reestructuración de deuda',
    description: 'Optional observation or justification note',
  })
  @IsOptional()
  @IsString()
  observation?: string;
}
