import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class DistributeEmelnorteTrashRateRequest {
  @ApiProperty({
    example: '0200236479001',
    description: 'Identification number (Cedula or RUC) of the client',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  clientId!: string;

  @ApiProperty({
    example: 39.38,
    description: 'Total trash rate amount billed in September from EMELNORTE',
    required: true,
  })
  @IsNumber()
  @IsPositive()
  septemberTotal!: number;

  @ApiProperty({
    example: ['22-492', '22-493', '22-240'],
    description: 'Array of active connection IDs belonging to the client in EPAA',
    type: [String],
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  activeConnectionIds!: string[];

  @ApiPropertyOptional({
    example: 4,
    description: 'Declared number of trash rate items in EMELNORTE (for audit mismatch checking)',
  })
  @IsOptional()
  @IsNumber()
  emelnorteQuantity?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether to persist the assignments into the database (default: false)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  persist?: boolean;
}
