export interface ReadingResponse {
  sector: number;
  account: number;
  year: number;
  month: string;
  previousReading: number;
  currentReading: number | null;
  rentalIncomeCode: number | null;
  novelty: string | null;
  readingValue: number | null;
  sewerRate: number | null;
  reconnection: number | null;
  incomeCode: number | null;
  readingDate: Date;
  readingTime: string | null;
  cadastralKey: string;
}

export interface PendingReadingResponse {
  // Cliente (solo en la primera fila):
  cardId: string;
  name: string;
  lastName: string;
  // Por cada suministro/planilla:
  cadastralKey: string;
  address: string;
  rate: string;
  month: string;
  year: number;
  currentReading: number;
  previousReading: number;
  readingValue: number;
  consumption: number;
  monthDue: string;
  yearDue: number;
  readingStatus: string;
  paymentDate: Date | null;
  trashRate: number;
  epaaValue: number;
  thirdPartyValue: number;
  total: number;
  dueDate: Date | null;
  incomeStatus: string;
  incomeDate: Date | null;
}
