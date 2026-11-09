import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UserPermissionBatchItemDto {
  @ApiProperty({
    example: 1,
    description: 'Permission ID',
    required: true,
  })
  @IsNumber()
  public permissionId: number;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Expiration date for temporary permission assignment',
    required: false,
  })
  @IsOptional()
  public expirationDate?: Date | string | null;
}

export class AssignPermissionsBatchToUserRequest {
  @ApiProperty({
    example: '12345678-1234-1234-1234-123456789012',
    description: 'User ID',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  public userId: string;

  @ApiProperty({
    type: [UserPermissionBatchItemDto],
    description: 'Array of permissions to assign with optional expiration date',
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPermissionBatchItemDto)
  public permissions: UserPermissionBatchItemDto[];

  constructor(userId: string, permissions: UserPermissionBatchItemDto[]) {
    this.userId = userId;
    this.permissions = permissions;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getPermissions(): UserPermissionBatchItemDto[] {
    return this.permissions;
  }
}
