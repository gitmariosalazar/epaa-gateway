import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionToUserRequest {
  @ApiProperty({
    example: '12345678-1234-1234-1234-123456789012',
    description: 'User ID',
    required: true,
  })
  public userId: string;

  @ApiProperty({
    example: 1,
    description: 'Permission ID',
    required: true,
  })
  public permissionId: number;

  constructor(userId: string, permissionId: number) {
    this.userId = userId;
    this.permissionId = permissionId;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getPermissionId(): number {
    return this.permissionId;
  }
}

export class RemovePermissionFromUserRequest {
  @ApiProperty({
    example: '12345678-1234-1234-1234-123456789012',
    description: 'User ID',
    required: true,
  })
  public userId: string;

  @ApiProperty({
    example: 1,
    description: 'Permission ID',
    required: true,
  })
  public permissionId: number;

  constructor(userId: string, permissionId: number) {
    this.userId = userId;
    this.permissionId = permissionId;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getPermissionId(): number {
    return this.permissionId;
  }
}
