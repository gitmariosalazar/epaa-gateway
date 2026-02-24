import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionRequest {
  @ApiProperty({
    example: 'CREATE_USER',
    description: 'Name of the permission',
    type: String,
    required: false,
  })
  permissionName?: string;
  @ApiProperty({
    example: 'Allows creating a user',
    description: 'Description of the permission',
    type: String,
    required: false,
  })
  permissionDescription?: string;
  @ApiProperty({
    example: true,
    description: 'Indicates if the permission is active',
    type: Boolean,
    required: false,
  })
  isActive?: boolean;
  @ApiProperty({
    example: 1,
    description: 'Category ID of the permission',
    type: Number,
    required: false,
  })
  categoryId?: number;
  @ApiProperty({
    example: 'scope1,scope2',
    description: 'Scopes associated with the permission',
    type: String,
    required: false,
  })
  scoppes?: string;

  constructor(
    permissionName?: string,
    permissionDescription?: string,
    isActive?: boolean,
    categoryId?: number,
    scoppes?: string,
  ) {
    this.permissionName = permissionName;
    this.permissionDescription = permissionDescription;
    this.isActive = isActive;
    this.categoryId = categoryId;
    this.scoppes = scoppes;
  }
}
