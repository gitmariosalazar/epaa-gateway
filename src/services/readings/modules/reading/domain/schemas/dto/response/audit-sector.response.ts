export interface AuditSectorResponse {
  auditId: number;
  readingMonth: Date; // mesLectura
  sectorId: number;
  expectedTotal: number; // totalEsperado
  completedTotal: number; // totalCompletadas
  pendingTotal: number; // totalPendientes
  progressPercentage: number; // avancePorcentaje
  isComplete: boolean; // completo
  closureDate: Date | null; // fechaCierre
  supervisorId: string | null;
  observations: string | null; // observaciones
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditSectorHistoryResponse {
  readingMonth: Date;
  sectorId: number;
  expectedTotal: number;
  completedTotal: number;
  progressPercentage: number;
  isComplete: boolean;
  closureDate: Date | null;
  supervisorId: string | null;
  observations: string | null;
  createdAt: Date;
}

export interface CloseAuditSectorResponse {
  auditId: number;
  sectorId: number;
  readingMonth: Date;
  isComplete: boolean;
  closureDate: Date;
  supervisorId: string | null;
  observations: string | null;
  createdAt: Date;
}

export interface InitializeAuditResponse {
  message: string;
  period: string;
  sectorsGenerated: number;
}
