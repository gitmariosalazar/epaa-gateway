import { ApiProperty } from '@nestjs/swagger';

export class DeferredConceptSummaryResponse {
  @ApiProperty({ example: 4, description: 'Concept ID (e.g. for TASA_BASURA)' })
  conceptId!: number;

  @ApiProperty({ example: 'TASA_BASURA', description: 'Concept unique code' })
  conceptCode!: string;

  @ApiProperty({ example: 15.5, description: 'Deferred amount accumulated across invoices' })
  accumulatedAmount!: number;

  @ApiProperty({ example: 3, description: 'Number of affected invoices' })
  originInvoicesCount!: number;

  @ApiProperty({ example: 'EXONERAR_A_CERO', description: 'Treatment applied' })
  treatment!: string;
}

export class PaymentAgreementResponse {
  @ApiProperty({ example: 1, description: 'Payment agreement primary key' })
  agreementId!: number;

  @ApiProperty({ example: 'CONV-2026-0001', description: 'Agreement contract number' })
  agreementCode!: string;

  @ApiProperty({ example: '22-492', description: 'Connection ID' })
  connectionId!: string;

  @ApiProperty({ example: '0200236479001', description: 'Client identification' })
  clientId!: string;

  @ApiProperty({ example: 6, description: 'Agreed number of installments' })
  numberOfInstallments!: number;

  @ApiProperty({ example: 120.5, description: 'Total refinanced debt' })
  totalRefinancedAmount!: number;

  @ApiProperty({ example: 'ACTIVO', description: 'Agreement status' })
  status!: string;

  @ApiProperty({ example: '2026-10-25T00:00:00.000Z', description: 'Agreement registration date' })
  agreementDate!: Date;

  @ApiProperty({ example: 3, description: 'Total invoices linked to agreement' })
  affectedInvoicesCount!: number;

  @ApiProperty({
    type: [DeferredConceptSummaryResponse],
    description: 'Breakdown of deferred concepts (such as TASA_BASURA zeroed out)',
  })
  deferredConcepts!: DeferredConceptSummaryResponse[];

  @ApiProperty({ example: 'Convenio de pago aplicado exitosamente', description: 'Result message' })
  message!: string;
}
