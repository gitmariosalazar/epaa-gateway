import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsIn, IsOptional } from 'class-validator';

/**
 * VerifyCodeRequest — DTO para verificar el código ingresado por el cliente.
 */
export class VerifyCodeRequest {
  @ApiProperty({
    description: 'UUID del cliente_usuario que quiere verificar su cuenta',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  clienteUsuarioId: string;

  @ApiProperty({
    description: 'Código de 6 dígitos recibido por email o teléfono',
    example: '483920',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiPropertyOptional({
    description: 'Tipo de verificación usado al solicitar el código',
    example: 'EMAIL_CODE',
    enum: ['EMAIL_CODE', 'PHONE_CODE'],
    default: 'EMAIL_CODE',
  })
  @IsOptional()
  @IsIn(['EMAIL_CODE', 'PHONE_CODE'])
  tipoCodigo?: string = 'EMAIL_CODE';
}
