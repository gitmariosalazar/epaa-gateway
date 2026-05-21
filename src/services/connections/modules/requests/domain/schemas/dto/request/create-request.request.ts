import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestRequest {
  @ApiProperty({
    example: '1003938477',
    type: String,
    title: 'Client ID',
    description: 'Unique identifier for the client making the request',
    required: true,
  })
  clientId!: string;
  @ApiProperty({
    example: 'NATURAL',
    enum: ['NATURAL', 'JURIDICA'],
    description: 'Type of person making the request',
    required: true,
  })
  personType!: string;
  @ApiProperty({
    example: 'AGUA_POTABLE',
    enum: ['AGUA_POTABLE', 'ALCANTARILLADO', 'ELECTRICIDAD'],
    description: 'Type of connection requested',
    required: true,
  })
  connectionType!: string;
  @ApiProperty({
    example: 'RESIDENCIAL',
    enum: ['RESIDENCIAL', 'COMERCIAL', 'INDUSTRIAL'],
    description: 'Intended use of the property',
    required: true,
  })
  propertyUse!: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'Address of the property for the connection request',
    required: true,
    type: String,
  })
  address!: string;
  @ApiProperty({
    example: 'ABC123456789',
    description: 'Cadastral key for the property',
    required: true,
    type: String,
  })
  cadastralKey!: string;
  @ApiProperty({
    example: 'POINT(-73.935242 40.730610)',
    nullable: true,
    description: 'Geometric location of the property in WKT format',
    required: false,
    type: String,
  })
  geom!: string | null;
  @ApiProperty({
    example: {
      key: 'value',
    },
    description: 'Additional information related to the connection request',
    required: false,
    type: Object,
  })
  additionalInfo!: Record<string, any>;
}
