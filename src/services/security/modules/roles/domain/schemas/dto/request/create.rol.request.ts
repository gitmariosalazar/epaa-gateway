import { ApiProperty } from '@nestjs/swagger';

export class CreateRolRequest {
  @ApiProperty({
    description: 'Name of the role',
    example: 'Admin',
    required: true,
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
    description: 'ID of the parent role',
    example: 1,
    required: false,
    type: Number,
  })
  parentRolId?: number;
}
