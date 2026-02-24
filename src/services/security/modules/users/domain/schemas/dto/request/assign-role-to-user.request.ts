import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleToUserRequest {
  @ApiProperty({
    example: '12345678-1234-1234-1234-123456789012',
    description: 'User ID',
    required: true,
  })
  public userId: string;

  @ApiProperty({
    example: 1,
    description: 'Role ID',
    required: true,
  })
  public roleId: number;

  constructor(userId: string, roleId: number) {
    this.userId = userId;
    this.roleId = roleId;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getRoleId(): number {
    return this.roleId;
  }
}

export class RemoveRoleFromUserRequest {
  @ApiProperty({
    example: '12345678-1234-1234-1234-123456789012',
    description: 'User ID',
    required: true,
  })
  public userId: string;

  @ApiProperty({
    example: 1,
    description: 'Role ID',
    required: true,
  })
  public roleId: number;

  constructor(userId: string, roleId: number) {
    this.userId = userId;
    this.roleId = roleId;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getRoleId(): number {
    return this.roleId;
  }
}
