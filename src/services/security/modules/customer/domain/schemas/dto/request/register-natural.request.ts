import { ApiProperty } from '@nestjs/swagger';

export class RegisterNaturalRequest {
  @ApiProperty({
    example: 'password123',
    description: 'Contraseña para la cuenta externa',
    type: String,
  })
  password!: string;

  @ApiProperty({
    example: '1003938477',
    description: 'Cédula de la persona natural',
    type: String,
  })
  clientId!: string;

  @ApiProperty({
    example: 'cliente@example.com',
    description: 'Correo electrónico de la cuenta',
    type: String,
  })
  email!: string;

  @ApiProperty({
    example: ['cliente@example.com'],
    description: 'Correos electrónicos del cliente para su ficha de perfil',
    type: [String],
  })
  emails!: string[];

  @ApiProperty({
    example: 'John',
    description: 'Nombres del ciudadano (persona natural)',
    type: String,
  })
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Apellidos del ciudadano (persona natural)',
    type: String,
  })
  lastName!: string;

  @ApiProperty({
    example: ['+1234567890'],
    description: 'Números de teléfono del cliente',
    type: [String],
  })
  phoneNumbers!: string[];

  @ApiProperty({
    example: '1990-01-01',
    description: 'Fecha de nacimiento del cliente',
    type: Date,
  })
  dateOfBirth!: Date;

  @ApiProperty({
    example: 1,
    description: 'ID de sexo del cliente',
    type: Number,
  })
  sexId!: number;

  @ApiProperty({
    example: 1,
    description: 'Estado civil del cliente',
    type: Number,
  })
  civilStatus!: number;

  @ApiProperty({
    example: '123 Main St',
    description: 'Dirección del domicilio',
    type: String,
  })
  address!: string;

  @ApiProperty({
    example: 1,
    description: 'ID de profesión del cliente',
    type: Number,
  })
  professionId!: number;

  @ApiProperty({
    example: 'ECUADOR',
    description: 'País de origen',
    type: String,
  })
  originCountry!: string;

  @ApiProperty({
    example: 'CED',
    description: 'Tipo de identificación',
    type: String,
  })
  identificationType!: string;

  @ApiProperty({
    example: '100150',
    description: 'ID de la parroquia del domicilio',
    type: String,
  })
  parishId!: string;

  @ApiProperty({
    example: false,
    description: 'Indica si el cliente ha fallecido',
    type: Boolean,
    required: false,
  })
  deceased?: boolean;
}
