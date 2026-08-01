import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignAnalystToRequestRequest {
  @ApiProperty({
    description: 'ID del analista (usuario) a asignar a la solicitud',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  analystId!: string;
}
