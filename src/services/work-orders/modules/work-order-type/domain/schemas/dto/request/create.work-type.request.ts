import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkTypeRequest {
  @ApiProperty({
    example: 'Electrical Maintenance',
    description: 'Name of the work order type',
    type: String,
    required: true,
  })
  name: string;

  @ApiProperty({
    example: 'Maintenance of electrical systems',
    description: 'Description of the work order type',
    type: String,
    required: true,
  })
  description: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the department associated with the work order type',
    type: Number,
    required: false,
  })
  departmentId?: number;

  constructor(name: string, description: string, departmentId?: number) {
    this.name = name;
    this.description = description;
    if (departmentId !== undefined) {
      this.departmentId = departmentId;
    }
  }
}
