import { ApiProperty } from "@nestjs/swagger";

export class CreateWorkOrderTypeRequest {
  @ApiProperty({
    example: 'Maintenance',
    type: String,
    required: true,
  })
  name: string;
  @ApiProperty({
    example: 'Work order type for maintenance tasks',
    type: String,
    required: true,
  })
  description: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
}