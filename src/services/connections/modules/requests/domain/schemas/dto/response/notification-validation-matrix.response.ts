import { ApiProperty } from '@nestjs/swagger';

export class NotificationValidationMatrixRowResponse {
  @ApiProperty({ example: 'F8' })
  phaseCode: string;

  @ApiProperty({ example: 'Informe Tecnico Subido' })
  phaseName: string;

  @ApiProperty({ example: 'INSPECCION_EN_PROCESO -> INFORME_EN_REVISION' })
  workflowTransition: string;

  @ApiProperty({ example: 'notifications.acometidas.informe_subido' })
  kafkaEvent: string;

  @ApiProperty({ example: 'Analista Revisor' })
  destinationRole: string;

  @ApiProperty({ example: 'acometidas.solicitud.id_analista' })
  destinationSource: string;

  @ApiProperty({ example: 'connection' })
  producerService: string;

  @ApiProperty({ example: 'notifications' })
  consumerService: string;

  @ApiProperty({ example: 'IN_APP' })
  channels: string;

  @ApiProperty({ example: true })
  implementedInNotifications: boolean;

  @ApiProperty({
    example: 'Verificar alerta al analista de informe pendiente de aprobacion.',
  })
  qaCheck: string;
}

export class NotificationValidationMatrixResponse {
  @ApiProperty({ example: '2026-06-05T20:00:00.000Z' })
  generatedAt: Date;

  @ApiProperty({ example: 14 })
  totalEvents: number;

  @ApiProperty({ example: 9 })
  coveredEvents: number;

  @ApiProperty({ example: 5 })
  missingConsumers: number;

  @ApiProperty({ type: [NotificationValidationMatrixRowResponse] })
  rows: NotificationValidationMatrixRowResponse[];
}
