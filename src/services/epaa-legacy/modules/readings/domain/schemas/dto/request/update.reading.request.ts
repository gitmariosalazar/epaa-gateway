import { ApiProperty } from '@nestjs/swagger';

export class UpdateReadingLegacyRequest {
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
  @ApiProperty({
    description: 'Current reading value',
    example: 1000,
    type: 'number',
    required: true,
  })
  currentReading: number;
  @ApiProperty({
    description: 'Cadastral key',
    example: '21-260',
    type: 'string',
    required: true,
  })
  cadastralKey: string;
  @ApiProperty({
    description: 'Novelty',
    example: null,
    type: 'string',
    required: false,
  })
  novelty: string | null;
  @ApiProperty({
    description: 'Rental income code',
    example: null,
    type: 'number',
    required: false,
  })
  rentalIncomeCode: number | null;
  @ApiProperty({
    description: 'Reading value',
    example: null,
    type: 'number',
    required: false,
  })
  readingValue: number | null;
  @ApiProperty({
    description: 'Sewer rate',
    example: null,
    type: 'number',
    required: false,
  })
  sewerRate: number | null;
  @ApiProperty({
    description: 'Reconnection',
    example: null,
    type: 'number',
    required: false,
  })
  reconnection: number | null;
  @ApiProperty({
    description: 'Income code',
    example: null,
    type: 'number',
    required: false,
  })
  incomeCode: number | null;
  @ApiProperty({
    description: 'Reading date',
    example: '2026-01-01',
    type: 'string',
    required: true,
  })
  readingDate: Date;
  @ApiProperty({
    description: 'Reading time',
    example: '12:00',
    type: 'string',
    required: true,
  })
  readingTime: string;
}
