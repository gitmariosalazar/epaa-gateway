import { ApiProperty } from '@nestjs/swagger';

export class AuthRequest {
  @ApiProperty({
    example: '1003938477',
    description: 'Here you will type the username or email',
    type: String,
    required: true,
  })
  username_or_email: string;
  @ApiProperty({
    example: '1001590650ANDmar10',
    description: 'Type your password',
    type: String,
    required: true,
  })
  password: string;

  constructor(username_or_email: string, password: string) {
    this.username_or_email = username_or_email;
    this.password = password;
  }
}
