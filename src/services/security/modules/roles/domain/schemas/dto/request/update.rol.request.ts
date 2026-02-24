import { ApiProperty } from '@nestjs/swagger';

export class UpdateRolRequest {
  @ApiProperty({
    description: 'Name of the role',
    example: 'Admin',
    required: false,
    type: String,
  })
  name: string;
  @ApiProperty({
    description: 'Description of the role',
    example: 'Administrator role with full permissions',
    required: false,
    type: String,
  })
  description?: string;
  @ApiProperty({
    description: 'Indicates if the role is active',
    example: true,
    required: false,
    type: Boolean,
  })
  active?: boolean;
}
