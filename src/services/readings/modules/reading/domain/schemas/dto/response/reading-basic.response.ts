export interface ReadingBasicInfoResponse {
  readingId: number
  previousReadingDate: Date | null
  cadastralKey: string
  cardId: string
  firstNames: string
  lastNames: string
  address: string
  previousReading: number
  currentReading: number | null
  sector: number
  account: number
}