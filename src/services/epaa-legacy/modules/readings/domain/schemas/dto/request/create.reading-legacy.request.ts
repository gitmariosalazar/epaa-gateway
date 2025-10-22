import { ApiProperty } from "@nestjs/swagger"
import { StringSchema } from "joi"

export class CreateReadingLegacyRequest {

  @ApiProperty({
    example: 1500,
    description: 'Previous reading value',
    required: true,
  })
  previousReading: number
  @ApiProperty({
    example: 1600,
    description: 'Current reading value',
    required: true,
  })
  currentReading: number
  @ApiProperty({
    example: '23-162',
    description: 'Cadastral key associated with the reading',
    required: true,
  })
  cadastralKey: string

  @ApiProperty({
    example: 'NORMAL',
    description: 'Novelty or special condition related to the reading',
    required: true,
  })
  novelty: string
  sector: number
  account: number
  year: number
  month: string
  rentalIncomeCode: number | null
  readingValue: number | null
  sewerRate: number | null
  reconnection: number | null
  //incomeCode: number | null
  readingDate: Date
  readingTime: string
}
