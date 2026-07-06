import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class SubmitCorrectionsRequest {
  @ApiProperty({ description: 'ID del cliente o usuario que sube la corrección', type: String })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Lista de IDs de documentos correspondientes a los archivos, en el mismo orden',
    type: String,
    example: 'uuid1,uuid2',
  })
  @IsNotEmpty()
  @IsString()
  documentIds: string;
}
