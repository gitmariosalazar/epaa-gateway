import { ApiProperty } from '@nestjs/swagger';

// AgremmentsParams se mantiene igual, ya que no se han realizado cambios en ese archivo.
export type SearchType = 'YEAR' | 'MONTH' | 'DAY';
export class AgreementsParams {
  @ApiProperty({
    description: 'El tipo de búsqueda: YEAR, MONTH o DAY',
    enum: ['YEAR', 'MONTH', 'DAY'],
    type: String,
    required: false,
  })
  searchType?: SearchType; // Tipo de búsqueda: YEAR, MONTH o DAY

  @ApiProperty({
    description: 'El año de inicio para las búsquedas anuales',
    example: 2026,
    type: Number,
    required: false,
  })
  startYear?: number; // YYYY para búsquedas anuales
  @ApiProperty({
    description: 'El año de fin para las búsquedas anuales',
    example: 2026,
    type: Number,
    required: false,
  })
  endYear?: number; // YYYY para búsquedas anuales
}

export class AgreementsCustomerParams {
  @ApiProperty({
    description: 'El tipo de búsqueda: YEAR, MONTH o DAY',
    enum: ['YEAR', 'MONTH', 'DAY'],
    type: String,
    required: false,
  })
  searchType?: SearchType; // Tipo de búsqueda: YEAR, MONTH o DAY
  @ApiProperty({
    description: 'El año de inicio para las búsquedas anuales',
    example: 2026,
    type: Number,
    required: false,
  })
  startYear?: number; // YYYY para búsquedas anuales
  @ApiProperty({
    description: 'El año de fin para las búsquedas anuales',
    example: 2026,
    type: Number,
    required: false,
  })
  endYear?: number; // YYYY para búsquedas anuales
}
