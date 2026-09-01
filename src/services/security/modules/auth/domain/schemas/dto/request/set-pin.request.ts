import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SetPinRequest {
  @ApiProperty({
    example: '1234',
    description: 'The security PIN you want to configure',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  pin: string;

  @ApiProperty({
    example: 'uuid',
    description: 'Optional User ID to set the PIN for (requires admin privileges)',
    type: String,
    required: false,
  })
  userId?: string;
}
