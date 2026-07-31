import { ApiProperty } from '@nestjs/swagger';

export class UpdateReadingLegacyRequest {
  @ApiProperty({
    description: 'Sector number',
    example: 21,
    type: Number,
    required: true,
  })
  sector!: number;
  @ApiProperty({
    description: 'Account number',
    example: 260,
    type: Number,
    required: true,
  })
  account!: number;
  @ApiProperty({
    description: 'Year of the reading',
    example: 2026,
    type: Number,
    required: true,
  })
  year!: number;
  @ApiProperty({
    description: 'Month of the reading',
    example: 'ENERO',
    type: String,
    required: true,
  })
  month!: string;
  @ApiProperty({
    description: 'Previous reading value',
    example: 982,
    type: Number,
    required: true,
  })
  previousReading!: number;
  @ApiProperty({
    description: 'Current reading value',
    example: 1000,
    type: Number,
    required: true,
  })
  currentReading!: number;
  @ApiProperty({
    description: 'Cadastral key',
    example: '21-260',
    type: String,
    required: true,
  })
  cadastralKey!: string;
  @ApiProperty({
    description: 'Novelty',
    example: null,
    type: String,
    required: false,
  })
  novelty!: string | null;
  @ApiProperty({
    description: 'Rental income code',
    example: null,
    type: Number,
    required: false,
  })
  rentalIncomeCode!: number | null;
  @ApiProperty({
    description: 'Reading value',
    example: null,
    type: Number,
    required: false,
  })
  readingValue!: number | null;
  @ApiProperty({
    description: 'Sewer rate',
    example: null,
    type: Number,
    required: false,
  })
  sewerRate!: number | null;
  @ApiProperty({
    description: 'Reconnection',
    example: null,
    type: Number,
    required: false,
  })
  reconnection!: number | null;
  @ApiProperty({
    description: 'Income code',
    example: null,
    type: Number,
    required: false,
  })
  incomeCode!: number | null;
  @ApiProperty({
    description: 'Reading date',
    example: '2026-01-01',
    type: Date,
    required: true,
  })
  readingDate!: Date;
  @ApiProperty({
    description: 'Reading time',
    example: '12:00',
    type: String,
    required: true,
  })
  readingTime!: string;

  @ApiProperty({
    description: 'Username of the person who made the reading',
    example: 'john_doe',
    type: String,
    required: true,
  })
  username!: string;

  @ApiProperty({
    description: 'Reading ID',
    example: '12345',
    type: String,
    required: true,
  })
  readingId!: string;
}
