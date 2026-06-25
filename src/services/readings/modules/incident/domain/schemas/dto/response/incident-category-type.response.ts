import { ApiProperty } from '@nestjs/swagger';

export class IncidentTypeResponse {
  @ApiProperty({
    example: 'NET001',
    description: 'The code of the incident type',
  })
  typeCode!: string;
  @ApiProperty({
    example: 'Network Issue',
    description: 'The name of the incident type',
  })
  typeName!: string;
  @ApiProperty({
    example: 'Issues related to network connectivity',
    description: 'The description of the incident type',
  })
  typeDescription!: string;
  @ApiProperty({
    example: true,
    description: 'Indicates if the incident type has a suggested priority',
  })
  suggestedPriority!: boolean;
}

export class IncidentCategoryResponse {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the incident category',
  })
  categoryId!: number;
  @ApiProperty({
    example: 'CAT001',
    description: 'The code of the incident category',
  })
  categoryCode!: string;
  @ApiProperty({
    example: 'Network Issue',
    description: 'The name of the incident category',
  })
  categoryName!: string;
  @ApiProperty({
    example: 'Issues related to network connectivity',
    description: 'The description of the incident category',
  })
  categoryDescription!: string;
  @ApiProperty({
    type: [IncidentTypeResponse],
    description: 'The types of incidents under this category',
  })
  incidentTypes!: IncidentTypeResponse[];
}

