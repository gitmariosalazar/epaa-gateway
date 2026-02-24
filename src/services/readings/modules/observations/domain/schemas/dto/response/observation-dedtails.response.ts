export interface ObservationDetailsResponse {
  observationId: number
  observationTitle: string;
  observationDetails: string;
  observationDate: string;
  readingId: number
  connectionId: number
  previousReading: number
  currentReading: number
  sector: number
  account: number
  cadastralKey: string
  rentalIncomeCode: number
  readingValue: number
  noveltyReadingTypeId: number
  noveltyTypeName: string
  noveltyTypeDescription: string
  clientId: string
  address: string
  clientName: string
  observations: string
}
