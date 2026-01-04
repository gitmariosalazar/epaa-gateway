import { ApiProperty } from '@nestjs/swagger';

export class FindCurrentReadingParams {
  @ApiProperty({
    description: 'Sector number',
    example: 21,
    type: 'number',
    required: true,
  })
  sector: number;

  @ApiProperty({
    description: 'Account number',
    example: 260,
    type: 'number',
    required: true,
  })
  account: number;

  @ApiProperty({
    description: 'Year of the reading',
    example: 2026,
    type: 'number',
    required: true,
  })
  year: number;

  @ApiProperty({
    description: 'Month of the reading',
    example: 'ENERO',
    type: 'string',
    required: true,
  })
  month: string;

  @ApiProperty({
    description: 'Previous reading value',
    example: 982,
    type: 'number',
    required: true,
  })
  previousReading: number;
}
