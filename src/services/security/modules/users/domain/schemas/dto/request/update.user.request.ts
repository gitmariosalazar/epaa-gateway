import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRequest {
  @ApiProperty({
    description: 'New username of the user',
    example: 'newusername123',
    type: String,
    required: false,
  })
  username?: string;
  @ApiProperty({
    description: 'New email of the user',
    example: 'newemail@example.com',
    type: String,
    required: false,
  })
  email?: string;

  constructor(
    username?: string,
    email?: string,
    firstName?: string,
    lastName?: string,
  ) {
    this.username = username;
    this.email = email;
  }
}
