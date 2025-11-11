import { ApiProperty } from "@nestjs/swagger"

export class CreateReadingRequest {
  @ApiProperty({
    example: 'A12345',
    description: 'Connection identifier',
    required: true
  })
  connectionId: string
  @ApiProperty({
    example: 1,
    description: 'Sector number',
    required: true
  })
  sector: number
  @ApiProperty({
    example: 123456,
    description: 'Account number',
    required: true
  })
  account: number
  @ApiProperty({
    example: 'C123456',
    description: 'Cadastral key',
    required: true
  })
  cadastralKey: string
  @ApiProperty({
    example: 100,
    description: 'Sewer rate',
    required: true
  })
  sewerRate: number
  @ApiProperty({
    example: 90,
    description: 'Previous reading',
    required: true
  })
  previousReading: number
  @ApiProperty({
    example: 100,
    description: 'Current reading',
    required: true
  })
  currentReading: number
  @ApiProperty({
    example: 2001,
    description: 'Income code',
    required: true
  })
  incomeCode: number
  @ApiProperty({
    example: 100,
    description: 'Reading value',
    required: true
  })
  readingValue: number
  @ApiProperty({
    example: 2001,
    description: 'Rental income code',
    required: true
  })
  rentalIncomeCode: number
  @ApiProperty({
    example: 'NO NOVELTY',
    description: 'Novelty',
    required: false
  })
  novelty: string | null
  @ApiProperty({
    example: 95,
    description: 'Average consumption',
    required: true
  })
  averageConsumption: number

  @ApiProperty({
    example: '2025-06',
    description: 'Previous month reading in YYYY-MM format',
    required: true,
    type: String
  })
  previousMonthReading: string;
}