import { ApiProperty } from '@nestjs/swagger';

export class SearchIncidentsRequest {
  @ApiProperty({
    example: '14-293',
    description: 'Filter by connection unique identifier (optional)',
    required: false,
    type: String,
  })
  connectionId?: string;

  @ApiProperty({
    example: 'REPORTADO',
    description: 'Filter by incident status (optional)',
    enum: ['REPORTADO', 'EN_INSPECCION', 'RESUELTO', 'FALSO_REPORTE'],
    required: false,
    type: String,
  })
  status?: string;

  @ApiProperty({
    example: 'MEDIA',
    description: 'Filter by incident priority (optional)',
    enum: ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'],
    required: false,
    type: String,
  })
  priority?: string;

  @ApiProperty({
    example: 1,
    description: 'Filter by incident category unique identifier (optional)',
    required: false,
    type: Number,
  })
  categoryId?: number;

  @ApiProperty({
    example: '10',
    description: 'Filter by sector (optional)',
    required: false,
    type: String,
  })
  sector?: string;

  @ApiProperty({
    example: 'Near the main street',
    description: 'Filter by reference (optional)',
    required: false,
    type: String,
  })
  reference?: string;

  @ApiProperty({
    example: '2023-06-01',
    description: 'Filter by report date (optional)',
    required: false,
    type: String,
  })
  reportDate?: Date;
}
