import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class LecturistLocationQueryDto {
  @ApiPropertyOptional({
    example: 0.3303998,
    description: 'Latitud actual del lecturista',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({
    example: -78.2187507,
    description: 'Longitud actual del lecturista',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;
}
