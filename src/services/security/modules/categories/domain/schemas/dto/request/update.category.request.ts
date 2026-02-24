import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryRequest {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Electronics',
    required: false,
    type: String,
  })
  categoryName?: string;
  @ApiProperty({
    description: 'Description of the category',
    example: 'Devices and gadgets',
    required: false,
    type: String,
  })
  categoryDescription?: string;
  @ApiProperty({
    description: 'Indicates if the category is active',
    example: true,
    required: false,
    type: Boolean,
  })
  isActive?: boolean;

  constructor(
    categoryName?: string,
    isActive?: boolean,
    categoryDescription?: string,
  ) {
    this.categoryName = categoryName;
    this.isActive = isActive;
    this.categoryDescription = categoryDescription;
  }
}
