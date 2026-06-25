import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'crypto';

export class IncidentResponse {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the incident',
  })
  incidentId!: number;

  @ApiProperty({
    example: '14-293',
    description:
      'The unique identifier of the connection linked to this incident (optional)',
    nullable: true,
  })
  connectionId!: string | null;

  @ApiProperty({
    example: 123,
    description:
      'The unique identifier of the reading linked to this incident (optional)',
    nullable: true,
  })
  readingId!: number | null;

  @ApiProperty({
    example: 1,
    description: 'The type ID of the incident',
  })
  incidentTypeId!: number;

  @ApiProperty({
    example: 'Broken pipe causing water leakage.',
    description: 'A detailed description of the reported incident',
  })
  reportDescription!: string;

  @ApiProperty({
    example: 'Av. Principal #123, block 4',
    description:
      'Reference address for matrix network or public road incidents (optional)',
    nullable: true,
  })
  referenceAddress!: string | null;

  @ApiProperty({
    example: 'PENDIENTE',
    description: 'The current status of the incident',
  })
  status!: string;

  @ApiProperty({
    example: 'LECTURISTA',
    description: 'The origin of the reported incident',
  })
  reportOrigin!: string;

  @ApiProperty({
    example: 'BAJA',
    description: 'The priority level of the incident',
  })
  priority!: string;

  @ApiProperty({
    example: '2026-06-22T17:29:27.000Z',
    description: 'The date and time when the incident was reported',
  })
  reportDate!: Date;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description:
      'The unique identifier of the user who reported the incident (optional/nullable)',
    nullable: true,
  })
  reporterUserId!: UUID | null;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174002',
    description:
      'The unique identifier of the client who reported the incident (optional/nullable)',
    nullable: true,
  })
  clienteUsuarioReportaId!: UUID | null;

  @ApiProperty({
    example: -12.046374,
    description: 'GPS latitude coordinate (optional)',
    nullable: true,
  })
  latitude!: number | null;

  @ApiProperty({
    example: -77.042793,
    description: 'GPS longitude coordinate (optional)',
    nullable: true,
  })
  longitude!: number | null;

  @ApiProperty({
    example: '2026-06-22T18:00:00.000Z',
    description: 'The date and time when the incident was resolved (optional)',
    nullable: true,
  })
  resolutionDate!: Date | null;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description:
      'The unique identifier of the user who resolved the incident (optional)',
    nullable: true,
  })
  resolverUserId!: UUID | null;

  @ApiProperty({
    example: 'Replaced the broken pipe with a new one.',
    description: 'A detailed description of the repair work done (optional)',
    nullable: true,
  })
  resolutionDescription!: string | null;

  @ApiProperty({
    example: true,
    description: 'Indicates whether the repair cost is charged to the user',
  })
  chargeToUser!: boolean;

  @ApiProperty({
    example: 150.5,
    description: 'The cost associated with repairing the incident',
  })
  repairCost!: number;
}
