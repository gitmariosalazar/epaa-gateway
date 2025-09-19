import { ApiProperty } from "@nestjs/swagger"

export class UpdateReadingRequest {
  @ApiProperty({
    example: 1152,
    description: 'The unique identifier of the reading to be updated',
    required: true,
  })
  previousReading: number;
  @ApiProperty({
    example: 12546,
    description: 'The consumption value recorded during the reading',
    required: true,
  })
  currentReading: number
  @ApiProperty({
    example: 1500,
    description: 'The consumption value calculated based on the difference between the current and previous readings',
    required: false,
  })
  rentalIncomeCode: number | null
  @ApiProperty({
    example: 'Connection with Status OK',
    description: 'Novelty or observations related to the reading',
    required: false,
  })
  novelty: string | null
  @ApiProperty({
    example: 1256,
    description: 'The income code associated with the reading',
    required: false,
  })
  incomeCode: number | null

  @ApiProperty({
    example: '14-514',
    description: 'The cadastral key associated with the reading',
    required: false,
  })
  cadastralKey?: string

  @ApiProperty({
    example: 14,
    description: 'The sector associated with the reading',
    required: false,
  })
  sector?: number
  @ApiProperty({
    example: 514,
    description: 'The account number associated with the reading',
    required: false,
  })
  account?: number
  @ApiProperty({
    example: '14-514',
    description: 'The connection ID associated with the reading',
    required: false,
  })
  connectionId?: string
}