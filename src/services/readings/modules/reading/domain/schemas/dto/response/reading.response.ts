export interface ReadingResponse {
  readingId: number;
  connectionId: string;
  readingDate: Date | null;
  readingTime: string | null;
  sector: number;
  account: number;
  cadastralKey: string;
  readingValue: number | null;
  sewerRate: number | null;
  previousReading: number | null;
  currentReading: number | null;
  rentalIncomeCode: number | null;
  novelty: string | null;
  incomeCode: number | null;
  locationCapture?: { lat: number; lng: number } | null;
  readingCode?: string;
}

export interface ReadingHistoryResponse {
  readingId: number;
  connectionId: string;
  readingYear: number;
  readingMonth: string;
  readingDate: Date;
  readingTime: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  observation: string;
  readingValue: number;
}

export interface ReadingImagesResponse {
  cadastralKey: string;
  readingId: number;
  previewsReading: number;
  currentReading: number;
  images: string[];
  readingMonth: string;
  readingYear: number;
  readingMonthName: string;
  novelty: string;
  consumption: number;
  observation: string;
}

export interface PendingReadingConnectionResponse {
  cadastralKey: string;
  meterNumber: string;
  address: string;
  sector: number;
  account: number;
  clientName: string;
  cardId: string;
  rateName: string;
  averageConsumption: number;
}

export interface TakenReadingConnectionResponse {
  readingId: string;
  readingDate: Date | null;
  cadastralKey: string;
  meterNumber: string;
  address: string;
  sector: number;
  account: number;
  clientName: string;
  cardId: string;
  previousReading: number;
  currentReading: number;
  readingValue: number;
  calculatedConsumption: number;
  averageConsumption: number;
  rateName: string;
  readingTypeId: number;
  readingTypeName: string;
  novelty?: string;
  locationCapture?: { lat: number; lng: number } | null;
  locationConnection?: { lat: number; lng: number } | null;
  distanceMeters?: number | null;
  isInsideAllowedRadius?: boolean | null;
  distanceLineGeoJSON?: any | null;
  readingCode?: string | null;
  userCreatedId?: string | null;
  userCreatedName?: string | null;
  userUpdatedId?: string | null;
  userUpdatedName?: string | null;
}

export interface ReadingNoveltyResponse {
  readingId: number;
  readingDate: Date | null;
  readingMonth: string;
  readingTime: string | null;
  cadastralKey: string;
  meterNumber: string;
  address: string;
  sector: number;
  account: number;
  clientName: string;
  cardId: string;
  previousReading: number;
  currentReading: number | null;
  readingValue: number | null;
  calculatedConsumption: number | null;
  averageConsumption: number | null;
  rateName: string;
  readingTypeId: number;
  readingTypeName: string;
  novelty: string;
  noveltyTypeId: number | null;
  noveltyTypeName: string | null;
  noveltyTypeDescription: string | null;
  images: string[];
  locationCapture?: { lat: number; lng: number } | null;
  locationConnection?: { lat: number; lng: number } | null;
  distanceMeters?: number | null;
  isInsideAllowedRadius?: boolean | null;
  distanceLineGeoJSON?: any | null;
  readingCode?: string | null;
  userCreatedId?: string | null;
  userCreatedName?: string | null;
  userUpdatedId?: string | null;
  userUpdatedName?: string | null;
}
