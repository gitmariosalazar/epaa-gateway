import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UnlockModuleRequest {
  @ApiProperty({
    description: 'ID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Security PIN provided by the user',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  pin: string;
}
