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
