import { ApiProperty } from '@nestjs/swagger';

export class UpdateCustomerRequest {
  @ApiProperty({
    example: 'nuevo.correo@example.com',
    description: 'Nuevo correo de la cuenta',
    type: String,
    required: false,
  })
  email?: string;

  @ApiProperty({
    example: 1,
    description: 'Nuevo estado de la cuenta (1: activo, 2: inactivo)',
    type: Number,
    required: false,
  })
  customerStatusId?: number;

  @ApiProperty({
    example: true,
    description: 'Activar o desactivar segundo factor',
    type: Boolean,
    required: false,
  })
  twoFactorEnabled?: boolean;

  @ApiProperty({
    example: true,
    description: 'Marca el email como verificado',
    type: Boolean,
    required: false,
  })
  emailVerified?: boolean;

  @ApiProperty({
    example: true,
    description: 'Marca el teléfono como verificado',
    type: Boolean,
    required: false,
  })
  telefonoVerified?: boolean;

  @ApiProperty({
    example: 'adminUser',
    description: 'Identificador del editor',
    type: String,
    required: false,
  })
  updatedBy?: string;

  constructor(params?: {
    email?: string;
    customerStatusId?: number;
    twoFactorEnabled?: boolean;
    emailVerified?: boolean;
    telefonoVerified?: boolean;
    updatedBy?: string;
  }) {
    if (params) {
      this.email = params.email;
      this.customerStatusId = params.customerStatusId;
      this.twoFactorEnabled = params.twoFactorEnabled;
      this.emailVerified = params.emailVerified;
      this.telefonoVerified = params.telefonoVerified;
      this.updatedBy = params.updatedBy;
    }
  }
}
