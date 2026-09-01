import { ApiProperty } from '@nestjs/swagger';

export class UpdateSpecialReadingRequest {
  @ApiProperty({
    example: 1,
    description: 'ID del tipo de ajuste especial',
    type: Number,
  })
  tipoAjusteId: number;

  @ApiProperty({
    example: 'Ajuste por daño de medidor',
    description: 'Justificación del ajuste',
    type: String,
  })
  justificacion: string;

  @ApiProperty({
    example: 100,
    description: 'Nueva lectura anterior',
    type: Number,
    required: false,
  })
  previousReading?: number | null;

  @ApiProperty({
    example: 150,
    description: 'Nueva lectura actual',
    type: Number,
    required: false,
  })
  currentReading?: number | null;

  @ApiProperty({
    example: 50,
    description: 'Nuevo valor de consumo',
    type: Number,
    required: false,
  })
  readingValue?: number | null;

  @ApiProperty({
    example: 10,
    description: 'Nueva tasa de alcantarillado',
    type: Number,
    required: false,
  })
  sewerRate?: number | null;

  @ApiProperty({
    example: 'AJUSTE',
    description: 'Novedad de la lectura',
    type: String,
    required: false,
  })
  novelty?: string | null;

  @ApiProperty({
    example: 1,
    description: 'ID de la novedad',
    type: Number,
    required: false,
  })
  typeNoveltyReadingId?: number | null;

  @ApiProperty({
    example: '14-514',
    description: 'The cadastral key associated with the reading',
    required: false,
  })
  cadastralKey?: string;

  @ApiProperty({
    example: 95,
    description: 'Average consumption',
    required: false,
  })
  averageConsumption?: number;
}
