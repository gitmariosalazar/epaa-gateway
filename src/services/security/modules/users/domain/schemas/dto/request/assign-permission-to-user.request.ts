import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Expiration date for temporary permission assignment',
    required: false,
  })
  public expirationDate?: Date | string | null;

  constructor(
    userId: string,
    permissionId: number,
    expirationDate?: Date | string | null,
  ) {
    this.userId = userId;
    this.permissionId = permissionId;
    this.expirationDate = expirationDate;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getPermissionId(): number {
    return this.permissionId;
  }

  public getExpirationDate(): Date | string | null | undefined {
    return this.expirationDate;
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
