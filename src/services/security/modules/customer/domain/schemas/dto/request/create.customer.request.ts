import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerRequest {
  @ApiProperty({
    example: '1003938477',
    description: 'Cédula o RUC de la persona natural o jurídica',
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
    example: 'password123',
    description: 'Contraseña para la cuenta externa',
    type: String,
    required: false,
  })
  password?: string;

  @ApiProperty({
    example: 'PASSWORD',
    description: 'Método de autenticación',
    type: String,
    default: 'PASSWORD',
  })
  authMethod?: string;

  @ApiProperty({
    example: 'GOOGLE',
    description: 'Proveedor de autenticación de terceros',
    type: String,
    required: false,
  })
  authProvider?: string;

  @ApiProperty({
    example: 2,
    description: 'Estado inicial de la cuenta (1: activo, 2: inactivo)',
    type: Number,
    default: 2,
  })
  customerStatusId?: number;

  @ApiProperty({
    example: 'adminUser',
    description: 'Identificador del creador del registro',
    type: String,
    required: false,
  })
  createdBy?: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombres del ciudadano (persona natural)',
    type: String,
    required: false,
  })
  firstName?: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellidos del ciudadano (persona natural)',
    type: String,
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    example: 'Mi Empresa',
    description: 'Nombre comercial de la empresa (persona jurídica)',
    type: String,
    required: false,
  })
  nombreComercial?: string;

  @ApiProperty({
    example: 'Mi Empresa S.A.',
    description: 'Razón social de la empresa (persona jurídica)',
    type: String,
    required: false,
  })
  razonSocial?: string;

  constructor(params?: {
    clientId: string;
    email: string;
    password?: string;
    authMethod?: string;
    authProvider?: string;
    customerStatusId?: number;
    createdBy?: string;
    firstName?: string;
    lastName?: string;
    nombreComercial?: string;
    razonSocial?: string;
  }) {
    if (params) {
      this.clientId = params.clientId;
      this.email = params.email;
      this.password = params.password;
      this.authMethod = params.authMethod;
      this.authProvider = params.authProvider;
      this.customerStatusId = params.customerStatusId;
      this.createdBy = params.createdBy;
      this.firstName = params.firstName;
      this.lastName = params.lastName;
      this.nombreComercial = params.nombreComercial;
      this.razonSocial = params.razonSocial;
    }
  }
}
