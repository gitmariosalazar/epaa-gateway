import { ApiProperty } from '@nestjs/swagger';

export class IncidentChangeDetail {
  @ApiProperty({ example: '01-02-03-004-005', required: false })
  clave_catastral?: string;

  @ApiProperty({ example: 'MTR-123456', required: false })
  numero_medidor?: string;

  @ApiProperty({ example: 'SN-7890', required: false })
  serie?: string;

  @ApiProperty({ example: 'Frente al parque central', required: false })
  ubicacion?: string;

  @ApiProperty({ example: 'Medidor reubicado por el usuario', required: false })
  observaciones?: string;
}

export class ResolveIncidentRequest {
  @ApiProperty({
    example: 'Replaced the broken pipe with a new one.',
    description: 'A detailed description of the repair work done',
    required: true,
  })
  description!: string;

  @ApiProperty({
    example: 150.5,
    description: 'The cost associated with repairing the incident',
    required: true,
  })
  repairCost!: number;

  @ApiProperty({
    example: true,
    description:
      'Indicates whether the repair cost should be charged to the user',
    required: true,
  })
  chargeToUser!: boolean;

  @ApiProperty({
    example: ['https://example.com/images/repair1.jpg'],
    description: 'Optional list of image URLs representing the resolution work',
    required: false,
    type: [String],
  })
  images?: string[];

  @ApiProperty({
    description:
      'Solo se envía cuando el usuario reporta cambios de datos del medidor/predio',
    required: false,
    type: [IncidentChangeDetail],
  })
  changeDetails?: IncidentChangeDetail[];
}
