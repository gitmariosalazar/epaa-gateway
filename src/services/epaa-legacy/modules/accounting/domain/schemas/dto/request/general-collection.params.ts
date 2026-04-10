import { ApiProperty } from '@nestjs/swagger';

export type dateFilter = 'paymentDate' | 'incomeDate';
export class GeneralCollectionsParams {
  @ApiProperty({
    description: 'El filtro de fecha a usar para el reporte',
    enum: ['paymentDate', 'incomeDate'],
    type: String,
    required: false,
  })
  dateFilter?: dateFilter;
  @ApiProperty({
    description: 'El año para los reportes o KPIs anuales y mensuales',
    example: 2026,
    type: Number,
    required: false,
  })
  year?: number;
  @ApiProperty({
    description: 'La fecha de inicio para el filtro',
    example: '2026-04-01',
    type: String,
    required: false,
  })
  startDate?: string; // YYYY-MM-DD
  @ApiProperty({
    description: 'La fecha de fin para el filtro',
    example: '2026-04-30',
    type: String,
    required: false,
  })
  endDate?: string; // YYYY-MM-DD
  @ApiProperty({
    description: 'El código de título para filtrar (Cod_Titulo_Datos)',
    example: 'AGP',
    type: String,
    required: false,
  })
  titleCode?: string; // Cod_Titulo_Datos
  @ApiProperty({
    description: 'Número máximo de registros a retornar (para paginación)',
    example: 100,
    type: Number,
    required: false,
  })
  limit?: number; // Para paginación, opcional
  @ApiProperty({
    description: 'Número de registros a omitir (para paginación)',
    example: 0,
    type: Number,
    required: false,
  })
  offset?: number; // Para paginación, opcional
}

export class GeneralTrendCollectionsParams {
  @ApiProperty({
    description: 'El filtro de fecha a usar para el reporte',
    enum: ['paymentDate', 'incomeDate'],
    type: String,
    required: false,
  })
  dateFilter?: dateFilter;

  @ApiProperty({
    description: 'El año para los reportes o KPIs anuales y mensuales',
    example: 2026,
    type: Number,
    required: false,
  })
  startYear?: number;

  @ApiProperty({
    description: 'El año final para los reportes o KPIs anuales y mensuales',
    example: 2026,
    type: Number,
    required: false,
  })
  endYear?: number;

  @ApiProperty({
    description: 'El código de título para filtrar (Cod_Titulo_Datos)',
    example: 'AGP',
    type: String,
    required: false,
  })
  titleCode?: string;

  @ApiProperty({
    description: 'Número máximo de registros a retornar (para paginación)',
    example: 100,
    type: Number,
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: 'Número de registros a omitir (para paginación)',
    example: 0,
    type: Number,
    required: false,
  })
  offset?: number;
}
