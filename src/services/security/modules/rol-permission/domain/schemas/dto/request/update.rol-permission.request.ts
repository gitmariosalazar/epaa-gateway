import { ApiProperty } from '@nestjs/swagger';

export class UpdateRolPermissionRequest {
  @ApiProperty({
    description: 'ID of the role',
    example: 1,
    type: Number,
    required: true,
  })
  rolId: number;
  @ApiProperty({
    description: 'ID of the permission',
    example: 1,
    type: Number,
    required: true,
  })
  permissionId: number;

  constructor(rolId: number, permissionId: number) {
    this.rolId = rolId;
    this.permissionId = permissionId;
  }
}
