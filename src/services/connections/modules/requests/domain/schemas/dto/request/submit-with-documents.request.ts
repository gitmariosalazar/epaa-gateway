import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO del gateway para la operación atómica multipart/form-data.
 * Los archivos llegan como Express.Multer.File[] y el gateway
 * los convierte a base64 antes de enviarlos por Kafka.
 */
export class SubmitWithDocumentsRequest {
  @ApiProperty({
    example: '1003938477',
    description:
      'Cédula/RUC del cliente (id_cliente en acometidas.solicitud — varchar 13)',
    type: String,
  })
  clientId!: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description:
      'Ignorado: el userId se toma del JWT autenticado (request.user.sub), nunca del body.',
    type: String,
    format: 'uuid',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    example: 'NATURAL',
    enum: ['NATURAL', 'JURIDICA'],
    description: 'Tipo de persona (natural o jurídica)',
  })
  personType!: string;

  @ApiProperty({
    example: 'AGUA_POTABLE',
    enum: ['AGUA_POTABLE', 'ALCANTARILLADO', 'ELECTRICIDAD'],
    description: 'Tipo de acometida solicitada',
  })
  connectionType!: string;

  @ApiProperty({
    example: 'RESIDENCIAL',
    enum: ['RESIDENCIAL', 'COMERCIAL', 'INDUSTRIAL'],
    description: 'Uso previsto del predio',
  })
  propertyUse!: string;

  @ApiProperty({
    example: 'Av. Amazonas N23-45 y Patria',
    description: 'Dirección del predio',
    type: String,
  })
  address!: string;

  @ApiProperty({
    example: '1701-01-001-000-000123-0000',
    description: 'Clave catastral del predio',
    type: String,
  })
  cadastralKey!: string;

  @ApiProperty({
    example: -78.4678,
    description: 'Longitud geográfica (WGS84). Opcional.',
    nullable: true,
    required: false,
    type: Number,
  })
  longitude?: number | null;

  @ApiProperty({
    example: -0.1807,
    description: 'Latitud geográfica (WGS84). Opcional.',
    nullable: true,
    required: false,
    type: Number,
  })
  latitude?: number | null;

  @ApiProperty({
    example: '{"num_pisos":2,"tiene_cisterna":true}',
    description: 'JSON con información adicional del predio (stringify)',
    required: false,
    type: String,
  })
  additionalInfo?: string;

  @ApiProperty({
    example: 'cedula-identidad,planilla-agua',
    description:
      'IDs de tipos de documento separados por coma — mismo orden que los archivos',
    type: String,
  })
  documentTypeIds!: string;

  @ApiProperty({
    description:
      'Archivos a adjuntar (uno o más). Mismo orden que documentTypeIds.',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  files!: any[];
}
