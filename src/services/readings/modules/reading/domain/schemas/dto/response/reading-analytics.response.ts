export interface ExecutiveDashboardAnalyticsResponse {
  analyzedPeriod: string;
  totalReadingsTaken: number;
  totalSectorsCovered: number;
  totalActiveConnections: number;
  totalVolumeM3: number;
  averageConsumptionPerAccountM3: number;
  minConsumptionM3: number;
  maxConsumptionM3: number;
  waterBilledUsd: number;
  sewerBilledUsd: number;
  totalBilledUsd: number;
  averageTicketPerAccountUsd: number;
  weightedAverageEffectiveTariffUsdPerM3: number;
  totalReadingsWithNovelty: number;
  operativeNoveltyPercentage: number;
  totalTitleUsd?: number;
  totalTrashTaxUsd?: number;
  totalThirdPartiesUsd?: number;
  totalInterestUsd?: number;
  totalSurchargesUsd?: number;
  totalBilledEpaaUsd?: number;
  totalInterestImprovementsUsd?: number;
  totalPaidWaterUsd?: number;
  totalUnpaidWaterUsd?: number;
  totalBillsGenerated?: number;
  paidBillsCount?: number;
  unpaidBillsCount?: number;
  overdueBillsCount?: number;
  upcomingBillsCount?: number;
  canceledBillsCount?: number;
  totalGeneralEmissionUsd?: number;
  totalCollectedUsd?: number;
  totalPendingDebtUsd?: number;
  totalOverdueDebtUsd?: number;
  totalUpcomingDebtUsd?: number;
  totalCanceledUsd?: number;
}

export interface SectorPerformanceAnalyticsResponse {
  sector: number;
  totalReadings: number;
  consumedVolumeM3: number;
  averageConsumptionM3: number;
  waterBilledUsd: number;
  sewerBilledUsd: number;
  totalBilledUsd: number;
  revenueSharePercentage: number;
  volumeSharePercentage: number;
  averageTariffUsdPerM3: number;
  noveltiesCount: number;
  noveltyPercentage: number;
  revenueRank: number;
  volumeRank: number;
  totalTitleUsd?: number;
  totalTrashTaxUsd?: number;
  totalThirdPartiesUsd?: number;
  totalInterestUsd?: number;
  totalSurchargesUsd?: number;
  totalBilledEpaaUsd?: number;
  totalInterestImprovementsUsd?: number;
  totalPaidWaterUsd?: number;
  totalUnpaidWaterUsd?: number;
  totalBillsGenerated?: number;
  paidBillsCount?: number;
  unpaidBillsCount?: number;
  overdueBillsCount?: number;
  upcomingBillsCount?: number;
  canceledBillsCount?: number;
  totalGeneralEmissionUsd?: number;
  totalCollectedUsd?: number;
  totalPendingDebtUsd?: number;
  totalOverdueDebtUsd?: number;
  totalUpcomingDebtUsd?: number;
  totalCanceledUsd?: number;
}

export interface MonthlyTrendAnalyticsResponse {
  readingMonth: string;
  totalReadings: number;
  totalVolumeM3: number;
  deltaVolumeM3: number | null;
  growthVolumePercentage: number | null;
  waterBilledUsd: number;
  sewerBilledUsd: number;
  totalBilledUsd: number;
  deltaRevenueUsd: number | null;
  growthRevenuePercentage: number | null;
}

export interface NoveltyEconomicImpactAnalyticsResponse {
  novelty: string;
  casesCount: number;
  shareOfTotalReadingsPercentage: number;
  totalVolumeM3: number;
  averageVolumePerCaseM3: number;
  waterBilledUsd: number;
  sewerBilledUsd: number;
  totalBilledUsd: number;
}

export interface TopConsumerAnalyticsResponse {
  readingId: number;
  sector: number;
  account: number;
  cadastralKey: string;
  connectionId: string;
  meterNumber: string;
  address: string;
  clientName: string;
  previousReading: number;
  currentReading: number;
  consumedVolumeM3: number;
  waterBilledUsd: number;
  sewerBilledUsd: number;
  totalBilledUsd: number;
  novelty: string;
  readingDate: string;
  gpsCoordinates: string | null;
}

export interface InterannualComparisonAnalyticsResponse {
  sector: number;
  homologousAccountsCount: number;
  readingsBaseYear: number;
  readingsTargetYear: number;
  deltaReadings: number;
  volumeBaseYearM3: number;
  volumeTargetYearM3: number;
  deltaVolumeM3: number;
  varianceVolumePercentage: number;
  billedBaseYearUsd: number;
  billedTargetYearUsd: number;
  deltaBilledUsd: number;
  varianceBilledPercentage: number;
  managementDiagnostic: string;
}

export interface MonthlyConnectionGrowthAnalyticsResponse {
  monthNumber: number;
  monthName: string;
  connectionsBaseYear: number;
  monthlyIncreaseBaseYear: number;
  connectionsTargetYear: number;
  monthlyIncreaseTargetYear: number;
  differenceTargetVsBase: number;
  interannualVariancePercentage: number;
  statusTargetYear: string;
}

export interface AnnualTrendAnalyticsResponse {
  year: number;
  totalReadings: number;
  totalActiveConnections: number;
  totalVolumeM3: number;
  averageConsumptionPerAccountM3: number;
  deltaVolumeM3: number | null;
  growthVolumePercentage: number | null;
  waterBilledUsd: number;
  sewerBilledUsd: number;
  totalBilledUsd: number;
  deltaRevenueUsd: number | null;
  growthRevenuePercentage: number | null;
  effectiveAverageTariffUsdPerM3: number;
  totalTitleUsd?: number;
  totalTrashTaxUsd?: number;
  totalThirdPartiesUsd?: number;
  totalInterestUsd?: number;
  totalSurchargesUsd?: number;
  totalBilledEpaaUsd?: number;
  totalInterestImprovementsUsd?: number;
  totalCollectedUsd?: number;
  totalPendingDebtUsd?: number;
  totalOverdueDebtUsd?: number;
  totalUpcomingDebtUsd?: number;
  totalCanceledUsd?: number;
  paidBillsCount?: number;
  unpaidBillsCount?: number;
  overdueBillsCount?: number;
  collectionEfficiencyPercentage?: number | null;
}
