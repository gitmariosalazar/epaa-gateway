import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetMovilePackConnectionsDto {
  @ApiPropertyOptional({
    description: 'ID o número del sector',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  sector?: number;

  @ApiPropertyOptional({
    description: 'Lista de claves catastrales (acometida_id)',
    example: ['1001001', '1001002'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cadastralKeys?: string[];
}
