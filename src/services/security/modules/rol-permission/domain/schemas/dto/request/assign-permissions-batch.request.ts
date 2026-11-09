import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionsBatchRequest {
  @ApiProperty({
    example: 1,
    description: 'Role ID',
    required: true,
  })
  public rolId: number;

  @ApiProperty({
    example: [1, 2, 3, 4],
    description: 'Array of Permission IDs to assign to the role',
    type: [Number],
    required: true,
  })
  public permissionIds: number[];

  constructor(rolId: number, permissionIds: number[]) {
    this.rolId = rolId;
    this.permissionIds = permissionIds;
  }

  public getRolId(): number {
    return this.rolId;
  }

  public getPermissionIds(): number[] {
    return this.permissionIds;
  }
}
