import { ApiProperty } from '@nestjs/swagger';

export class ResolveIncidentRequest {
  @ApiProperty({
    example: 'Replaced the broken pipe with a new one.',
    description: 'A detailed description of the repair work done',
    required: true,
  })
  description!: string;

  @ApiProperty({
    example: 150.5,
    description: 'The cost associated with repairing the incident',
    required: true,
  })
  repairCost!: number;

  @ApiProperty({
    example: true,
    description:
      'Indicates whether the repair cost should be charged to the user',
    required: true,
  })
  chargeToUser!: boolean;

  @ApiProperty({
    example: ['https://example.com/images/repair1.jpg'],
    description: 'Optional list of image URLs representing the resolution work',
    required: false,
    type: [String],
  })
  images?: string[];
}
