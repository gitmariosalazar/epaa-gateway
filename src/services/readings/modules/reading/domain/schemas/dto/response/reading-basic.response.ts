export interface ReadingBasicInfoResponse {
  readingId: number;
  previousReadingDate: Date | null;
  cadastralKey: string;
  cardId: string;
  clientName: string;
  address: string;
  previousReading: number;
  currentReading: number | null;
  sector: number;
  account: number;
  readingValue: number;
  averageConsumption: number;
  meterNumber: string;
  rateId: number;
  rateName: string;
}

export interface phones {
  telefonoid: number;
  numero: string;
}

export interface emails {
  emailid: number;
  email: string;
}

export interface ReadingInfoResponse {
  readingId: number;
  previousReadingDate: Date | null;
  readingTime: Date | null;
  readingDate: Date | null;
  cadastralKey: string;
  cardId: string;
  clientName: string;
  clientPhones: phones[];
  clientEmails: emails[];
  address: string;
  previousReading: number;
  currentReading: number | null;
  sector: number;
  account: number;
  readingValue: number;
  averageConsumption: number;
  meterNumber: string;
  rateId: number;
  rateName: string;
  hasCurrentReading: boolean;
  monthReading: string;
  startDatePeriod: Date;
  endDatePeriod: Date;
  connectionStateId: number;
  connectionStateName: string;
  connectionStateDescription: string;
  permitReading: boolean;
  connectionLocation?: { lat: number; lng: number } | null;
  images?: { id: number; path: string; novelty: string }[];
  observations?: { id: number; title: string; observation: string }[];
  readingLocation?: { lat: number; lng: number } | null;
}

export interface UserReadingActionAuditSqlResul {
  username: string | null;
  cardId: string | null;
  action: string | null;
  firstName: string | null;
  lastName: string | null;
  justification: string | null;
  previousReading: number | null;
  newReading: number | null;
  previousConsumption: number | null;
  newConsumption: number | null;
  approvalStatus: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE' | string | null;
  adjustmentDate: Date | null;
}

export interface ReadingDetailedResponse {
  readingId: number;
  readingCode: string;
  readingTime: Date | null;
  readingDate: Date | null;
  cadastralKey: string;
  cardId: string;
  clientName: string;
  clientPhones: phones[];
  clientEmails: emails[];
  address: string;
  previousReading: number;
  currentReading: number | null;
  sector: number;
  account: number;
  readingValue: number;
  totalEpaa: number;
  averageConsumption: number;
  meterNumber: string;
  rateId: number;
  rateName: string;
  hasCurrentReading: boolean;
  readingMonth: string;
  readingMonthName: string;
  novelty: string;
  consumption: number;
  startDatePeriod: Date;
  endDatePeriod: Date;
  connectionStateId: number;
  connectionStateName: string;
  connectionStateDescription: string;
  permitReading: boolean;
  connectionLocation?: { lat: number; lng: number } | null;
  images?: { id: number; path: string; novelty: string }[];
  observations?: { id: number; title: string; observation: string }[];
  readingLocation?: { lat: number; lng: number } | null;
  userActions?: UserReadingActionAuditSqlResul[];
  conceptDetails?: ConceptDetailResponse[];
  waterCalculationBreakdown?: WaterCalculationBreakdownResponse;
}

export interface ConceptDetailResponse {
  code: string;
  name: string;
  order: number;
  amount: number;
  formula: string;
  conceptId: number;
  description: string;
  defaultValue: any;
  tariffVersion: string;
  calculationBase: number;
  calculationType: string;
  isCompanyService: boolean;
  percentageApplied: number | null;
}
export interface WaterCalculationBreakdownResponse {
  categoryId: number;
  rateName: string;
  minRange: number;
  maxRange: number;
  appliedBase: number;
  additionalM3Rate: number;
  additionalM3: number;
  waterAmount: number;
  formula: string;
  tariffVersion: string;
}
