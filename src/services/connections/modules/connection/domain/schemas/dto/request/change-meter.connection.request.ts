import { ApiProperty } from '@nestjs/swagger';

export class PreviousMeterDetail {
  @ApiProperty({ example: 'MTR-123456', required: false })
  numero_medidor?: string;

  @ApiProperty({ example: 1520, required: false })
  ultima_lectura?: number;

  @ApiProperty({ example: '2026-07-15T00:00:00.000Z', required: false })
  fecha_ultima_lectura?: string;
}

export class NewMeterDetail {
  @ApiProperty({ example: 'MTR-789012' })
  numero_medidor!: string;

  @ApiProperty({ example: 1520, required: false })
  lectura_anterior?: number;

  @ApiProperty({ example: 0, required: false })
  lectura_actual?: number;

  @ApiProperty({ example: '2026-08-17T00:00:00.000Z', required: false })
  fecha_ultima_lectura?: string;
}

// Misma forma que IncidentChangeDetail (readings) para guardar detalles_cambio de forma uniforme
export class MeterChangeDetail {
  @ApiProperty({ example: '01-02-03-004-005', required: false })
  clave_catastral?: string;

  @ApiProperty({ example: 'MTR-789012', required: false })
  numero_medidor?: string;

  @ApiProperty({ example: 'SN-7890', required: false })
  serie?: string;

  @ApiProperty({ example: 'Frente al parque central', required: false })
  ubicacion?: string;

  @ApiProperty({
    example: 'Medidor da\u00f1ado, se reemplaz\u00f3',
    required: false,
  })
  observaciones?: string;

  @ApiProperty({ required: false, type: PreviousMeterDetail })
  medidor_anterior?: PreviousMeterDetail;

  @ApiProperty({ type: NewMeterDetail })
  medidor_nuevo!: NewMeterDetail;

  @ApiProperty({ example: 'user-uuid', required: false })
  user_id?: string; // ID del usuario que realiza el cambio, si aplica
}

export class ChangeMeterRequest {
  @ApiProperty({ type: MeterChangeDetail })
  changeDetail!: MeterChangeDetail;
}
