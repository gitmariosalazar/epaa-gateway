import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class SubmitCorrectionsRequest {
  @ApiProperty({
    description:
      'Ignorado: el userId se toma del JWT autenticado (request.user.sub), nunca del body.',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description:
      'Lista de IDs de documentos correspondientes a los archivos, en el mismo orden',
    type: String,
    example: 'uuid1,uuid2',
  })
  @IsNotEmpty()
  @IsString()
  documentIds: string;
}
