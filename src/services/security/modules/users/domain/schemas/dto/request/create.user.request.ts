import { ApiProperty } from '@nestjs/swagger';

export class CreateUserRequest {
  @ApiProperty({
    description: 'Username of the new user',
    example: 'john_doe',
    type: String,
    required: true,
  })
  username: string;
  @ApiProperty({
    description: 'Email address of the new user',
    example: 'mariosalazar@gmail.com',
    type: String,
    required: true,
  })
  email: string;
  @ApiProperty({
    description: 'Password for the new user',
    example: 'Password123!',
    type: String,
    required: true,
  })
  password: string;
  @ApiProperty({
    description: 'Confirmation of the password',
    example: 'Password123!',
    type: String,
    required: true,
  })
  confirmPassword: string;

  constructor(
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.confirmPassword = confirmPassword;
  }
}
