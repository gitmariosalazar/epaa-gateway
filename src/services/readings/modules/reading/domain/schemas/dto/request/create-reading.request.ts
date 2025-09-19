export class CreateReadingRequest {
  connectionId: string
  sector: number
  account: number
  cadastralKey: string
  sewerRate: number
  previousReading: number
  incomeCode: number
}