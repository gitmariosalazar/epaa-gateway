import { ApiProperty } from '@nestjs/swagger';

export class CreateIncidentRequest {
  @ApiProperty({
    example: '14-293',
    description:
      'The unique identifier of the connection linked to this incident (optional)',
    required: false,
  })
  connectionId?: string | null;

  @ApiProperty({
    example: 123,
    description:
      'The unique identifier of the reading linked to this incident (optional)',
    required: false,
  })
  readingId?: number | null;

  @ApiProperty({
    example: 1,
    description: 'The type ID of the incident',
    required: true,
  })
  incidentTypeId!: number;

  @ApiProperty({
    example: 'Broken pipe causing water leakage.',
    description: 'A detailed description of the reported incident',
    required: true,
  })
  reportDescription!: string;

  @ApiProperty({
    example: 'Av. Principal #123, block 4',
    description:
      'Reference address for matrix network or public road incidents (optional)',
    required: false,
  })
  referenceAddress?: string | null;

  @ApiProperty({
    example: 'LECTURISTA',
    description: 'The origin of the reported incident',
    enum: ['LECTURISTA', 'ATENCION_AL_CLIENTE', 'INSPECTOR', 'WEB_USUARIO'],
    required: true,
  })
  reportOrigin!:
    | 'LECTURISTA'
    | 'ATENCION_AL_CLIENTE'
    | 'INSPECTOR'
    | 'WEB_USUARIO';

  @ApiProperty({
    example: 'BAJA',
    description: 'The priority level of the incident',
    enum: ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'],
    required: false,
  })
  priority?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

  @ApiProperty({
    example: -12.046374,
    description:
      'GPS latitude coordinate (required if connectionId and referenceAddress are absent)',
    required: false,
  })
  latitude?: number | null;

  @ApiProperty({
    example: -77.042793,
    description:
      'GPS longitude coordinate (required if connectionId and referenceAddress are absent)',
    required: false,
  })
  longitude?: number | null;

  @ApiProperty({
    example: ['https://example.com/images/incident1.jpg'],
    description: 'Optional list of image URLs associated with the incident',
    required: false,
    type: [String],
  })
  images?: string[];
}
