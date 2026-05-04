import { ApiProperty } from '@nestjs/swagger';

export class VerifyUserRequest {
  @ApiProperty({
    example: 'mariosalazar',
    description: 'Username or email to verify existence in the system',
    type: String,
    required: true,
  })
  username_or_email: string;

  constructor(username_or_email: string) {
    this.username_or_email = username_or_email;
  }
}
