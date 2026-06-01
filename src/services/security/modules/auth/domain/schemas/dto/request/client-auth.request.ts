import { ApiProperty } from '@nestjs/swagger';

export class ClientAuthRequest {
  @ApiProperty({
    example: 'cliente@epaa.gob.ec',
    description: 'Correo o nombre de usuario(CI/RUC) del cliente',
  })
  username_or_email!: string;

  @ApiProperty({
    example: 'ClaveSegura123',
    description: 'Contraseña del cliente',
  })
  password?: string;
}
