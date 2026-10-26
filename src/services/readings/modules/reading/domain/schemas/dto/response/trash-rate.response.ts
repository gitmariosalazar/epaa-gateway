import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmelnorteDistributionItemResponse {
  @ApiProperty({ example: '22-492', description: 'Connection ID' })
  connectionId!: string;

  @ApiProperty({ example: '0200236479001', description: 'Client identification' })
  clientId!: string;

  @ApiProperty({ example: 13.13, description: 'Calculated trash rate share in dollars' })
  assignedAmount!: number;

  @ApiProperty({ example: true, description: 'Whether this item received a balancing penny remainder' })
  isPennyRemainder!: boolean;

  @ApiProperty({ example: false, description: 'Audit flag: mismatch between EMELNORTE declared quantity and active connections' })
  hasCadastralMismatch!: boolean;

  @ApiProperty({ example: 'EMELNORTE_DISTRIBUCION', description: 'Origin source' })
  origin!: string;

  @ApiProperty({ example: 'PLIEGO-2026-V1', description: 'Rate version sheet applied' })
  versionSheet!: string;

  @ApiProperty({ example: 39.38, description: 'Total amount billed in September' })
  totalClientOrigin!: number;

  @ApiPropertyOptional({ example: 4, nullable: true, description: 'Quantity declared in EMELNORTE' })
  emelnorteQuantityOrigin!: number | null;

  @ApiProperty({ example: 3, description: 'Total active connections used for division' })
  totalActiveConnections!: number;

  @ApiProperty({ example: 'Distribución proporcional EMELNORTE', description: 'Audit note' })
  observation!: string;
}

export class TrashRateAssignmentResponse {
  @ApiPropertyOptional({ example: 1, description: 'Assignment ID' })
  id?: number;

  @ApiProperty({ example: '22-492', description: 'Connection ID linked to rate' })
  connectionId!: string;

  @ApiProperty({ example: '0200236479001', description: 'Client identification at assignment time' })
  originClientId!: string;

  @ApiProperty({ example: 20.44, description: 'Assigned fixed monthly rate value' })
  assignedAmount!: number;

  @ApiProperty({ example: 'TARIFA_NUEVA_ACOMETIDA', description: 'Origin reason' })
  origin!: string;

  @ApiProperty({ example: 'PLIEGO-2026-V1', description: 'Rate version sheet' })
  versionSheet!: string;

  @ApiPropertyOptional({ example: 39.38, nullable: true })
  totalClientOrigin?: number | null;

  @ApiPropertyOptional({ example: 4, nullable: true })
  emelnorteQuantityOrigin?: number | null;

  @ApiPropertyOptional({ example: 3, nullable: true })
  totalActiveConnections?: number | null;

  @ApiProperty({ example: false, description: 'Cadastral mismatch flag' })
  hasCadastralMismatch!: boolean;

  @ApiProperty({ example: false, description: 'Penny remainder flag' })
  isPennyRemainder!: boolean;

  @ApiProperty({ example: true, description: 'Active status of the rate assignment' })
  isActive!: boolean;

  @ApiProperty({ example: '2026-10-25T00:00:00.000Z', description: 'Effective start date' })
  startDate!: Date;

  @ApiPropertyOptional({ example: null, nullable: true, description: 'End date if superseded' })
  endDate?: Date | null;

  @ApiPropertyOptional({ example: 'Asignación individual...', nullable: true, description: 'Audit observation' })
  observation?: string | null;
}
