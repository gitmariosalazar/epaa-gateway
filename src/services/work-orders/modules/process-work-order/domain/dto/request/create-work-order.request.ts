import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkOrderRequest {
  @ApiProperty({ example: 'EMERGENCIA', description: 'Order origin code' })
  origin!: string;

  @ApiProperty({ example: 1, description: 'Work type ID' })
  workTypeId!: number;

  @ApiProperty({ example: 3, description: 'Priority ID' })
  priorityId!: number;

  @ApiProperty({ example: '1711111111', description: 'Client identifier' })
  clientId!: string;

  @ApiProperty({
    example: '14-293',
    required: false,
    description: 'Cadastral key',
  })
  cadastralKey?: string;

  @ApiProperty({
    example: 'Av. de los Shyris y Naciones Unidas',
    description: 'Physical address',
  })
  location!: string;

  @ApiProperty({
    example: 'Leak in main line',
    required: false,
    description: 'Optional description',
  })
  description?: string;

  @ApiProperty({ example: -78.484, required: false, description: 'Longitude' })
  longitude?: number;

  @ApiProperty({ example: -0.179, required: false, description: 'Latitude' })
  latitude?: number;

  @ApiProperty({
    example: 'e3400d18-86e1-4eee-9a8b-3e7eaf812a95',
    description: 'Creator user ID',
  })
  createdByUserId!: string;

  @ApiProperty({
    example: '{"source":"mobile"}',
    required: false,
    description: 'Optional metadata as JSON string',
  })
  metadata?: string;
}
