import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsIn, IsOptional, IsUUID } from 'class-validator';

/**
 * ResendVerificationCodeRequest — DTO para reenviar el código.
 * El email se obtiene del microservicio de autenticación usando clienteUsuarioId.
 */
export class ResendVerificationCodeRequest {
  @ApiProperty({
    description: 'UUID del cliente_usuario que solicita un nuevo código',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  clienteUsuarioId: string;

  @ApiPropertyOptional({
    description: 'Tipo de verificación. Por defecto EMAIL_CODE',
    example: 'EMAIL_CODE',
    enum: ['EMAIL_CODE', 'PHONE_CODE'],
    default: 'EMAIL_CODE',
  })
  @IsOptional()
  @IsIn(['EMAIL_CODE', 'PHONE_CODE'])
  tipoCodigo?: string = 'EMAIL_CODE';
}
