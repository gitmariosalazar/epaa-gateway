import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordUserRequest {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'OldPassword123!',
    type: String,
    required: true,
  })
  oldPassword: string;
  @ApiProperty({
    description: 'New password for the user',
    example: 'NewPassword123!',
    type: String,
    required: true,
  })
  newPassword: string;
  @ApiProperty({
    description: 'Confirmation of the new password',
    example: 'NewPassword123!',
    type: String,
    required: true,
  })
  confirmNewPassword: string;

  constructor(
    oldPassword: string,
    newPassword: string,
    confirmNewPassword: string,
  ) {
    this.oldPassword = oldPassword;
    this.newPassword = newPassword;
    this.confirmNewPassword = confirmNewPassword;
  }
}
