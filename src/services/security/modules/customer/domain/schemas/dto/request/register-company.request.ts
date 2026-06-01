import { ApiProperty } from '@nestjs/swagger';

export class RegisterCompanyRequest {
  @ApiProperty({
    example: 'password123',
    description: 'Contraseña para la cuenta externa de la empresa',
    type: String,
  })
  password!: string;

  @ApiProperty({
    example: '1792345678001',
    description: 'RUC de la empresa',
    type: String,
  })
  companyRuc!: string;

  @ApiProperty({
    example: 'info@techsolutions.com',
    description: 'Correo electrónico de la cuenta',
    type: String,
  })
  email!: string;

  @ApiProperty({
    example: ['info@techsolutions.com'],
    description: 'Correos electrónicos de la empresa para su ficha de perfil',
    type: [String],
  })
  companyEmails!: string[];

  @ApiProperty({
    example: 'Tech Solutions LLC',
    description: 'Nombre comercial de la empresa',
    type: String,
  })
  companyName!: string;

  @ApiProperty({
    example: 'Tech Solutions for Modern Problems',
    description: 'Razón social de la empresa',
    type: String,
  })
  socialReason!: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'Dirección física de la empresa',
    type: String,
  })
  companyAddress!: string;

  @ApiProperty({
    example: '1',
    description: 'ID de la parroquia de la empresa',
    type: String,
  })
  companyParishId!: string;

  @ApiProperty({
    example: 'ECUADOR',
    description: 'País de la empresa',
    type: String,
  })
  companyCountry!: string;

  @ApiProperty({
    example: ['+1-234-567-8901'],
    description: 'Números de teléfono de la empresa',
    type: [String],
  })
  companyPhones!: string[];

  @ApiProperty({
    example: 'RUC',
    description: 'Tipo de identificación de la empresa',
    type: String,
  })
  identificationType!: string;
}
