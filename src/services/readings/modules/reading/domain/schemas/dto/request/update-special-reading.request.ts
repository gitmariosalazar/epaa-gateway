import { ApiProperty } from '@nestjs/swagger';

export class PhotoInputDto {
  @ApiProperty({
    example: 'https://storage.example.com/photos/evidence-1.jpg',
    description: 'URL de la foto de evidencia',
    type: String,
  })
  photoUrl: string;

  @ApiProperty({
    example: 'Foto de evidencia del medidor previo al ajuste',
    description: 'Descripción opcional de la foto de evidencia',
    type: String,
    required: false,
  })
  description?: string;
}

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

  @ApiProperty({
    description:
      'Fotos de evidencia (URLs en string o DTOs con photoUrl y descripción)',
    required: false,
    type: [PhotoInputDto],
  })
  photos?: (string | PhotoInputDto)[];

  @ApiProperty({
    description:
      'Alias opcional para fotos de evidencia (URLs en string o DTOs)',
    required: false,
    type: [PhotoInputDto],
  })
  evidencePhotos?: (string | PhotoInputDto)[];

  @ApiProperty({
    description:
      'Alias opcional para imágenes de evidencia (URLs en string o DTOs)',
    required: false,
    type: [PhotoInputDto],
  })
  images?: (string | PhotoInputDto)[];
}
