import { ApiProperty } from '@nestjs/swagger';

export type AuditTrashRateType =
  | 'Pendientes (Cartera Corriente)' // Audita los ingresos ya pagados dentro de un rango de fechas de emisión (`Fecha_Ingreso`).
  | 'En Mora (Cartera Vencida)' // Audita todos los ingresos pendientes dentro de un rango de fechas de emisión (`Fecha_Ingreso`)
  | 'Pagados (Recaudados)'
  | 'Todos (Pagados y Pendientes)'; // Audita todos los ingresos, sin importar su estado de pago, dentro de un rango de fechas de emisión (`Fecha_Ingreso`).

export type dateFilter = 'paymentDate' | 'incomeDate';

export interface TrashRateAuditReportParams {
  startDate: string;
  endDate: string;
  limit: number;
  offset: number;
  diagnosticFilter: 'DIFFERENT_AND_NO_RECORD' | 'ALL';
  auditType: AuditTrashRateType;
  dateFilter: dateFilter;
}

export class TrashRateReportParams {
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Start date in ISO format',
    example: '2026-01-01',
  })
  startDate: string;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'End date in ISO format',
    example: '2026-01-01',
  })
  endDate: string;

  @ApiProperty({
    type: 'number',
    description: 'Number of records to retrieve (top debtors)',
    example: 10,
    required: false,
  })
  top: number;

  @ApiProperty({
    type: 'number',
    description: 'Number of rows to return (pagination)',
    example: 100,
    required: false,
  })
  limit: number;

  @ApiProperty({
    type: 'number',
    description: 'Number of rows to skip (pagination)',
    example: 0,
    required: false,
  })
  offset: number;

  @ApiProperty({
    type: 'string',
    description:
      "Diagnostic filter. 'DIFFERENT_AND_NO_RECORD' returns only records with discrepancies or missing Valor entry. 'ALL' returns everything.",
    example: 'ALL',
    required: true,
  })
  diagnosticFilter: 'DIFFERENT_AND_NO_RECORD' | 'ALL';

  @ApiProperty({
    type: 'string',
    description: 'Type of audit report to generate.',
    enum: [
      'Auditoria general (Pagados)',
      'Ingresos pendientes de pago en caja  (Todos Ingresos sin pagar)',
      'Ingresos pendientes de pago en caja (Solo ingresos en Mora Ingresos sin pagar)',
      'Ingresos Netos (Por fecha de pago)',
      'Todos los ingresos (Pagados y Pendientes de pago en caja)',
    ],
    example: 'Auditoria general (Pagados)',
    required: false,
  })
  auditType?: AuditTrashRateType;

  @ApiProperty({
    type: 'string',
    description: 'Date filter for the audit report.',
    enum: ['paymentDate', 'incomeDate'],
    example: 'paymentDate',
    required: false,
  })
  dateFilter?: dateFilter;
}
