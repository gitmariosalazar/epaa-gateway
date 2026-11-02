import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DispatchedRouteSummaryResponseDto {
  @ApiProperty({ example: 12 })
  idAsignacion: number;

  @ApiProperty({ example: 'SEC01-R01' })
  codigoRuta: string;

  @ApiProperty({ example: 'c3a2f8b0-8c29-4d69-a1d2-092931481234' })
  lecturistaId: string;

  @ApiPropertyOptional({ example: 'Carlos Andrés Mendoza' })
  nombreLecturista?: string;

  @ApiProperty({ example: 158 })
  totalPredios: number;
}

export class BatchDispatchResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Despacho matutino ejecutado exitosamente para 14 rutas.' })
  message: string;

  @ApiProperty({ example: '2026-11' })
  periodo: string;

  @ApiProperty({ example: 14 })
  totalRutasAsignadas: number;

  @ApiProperty({ example: 2450 })
  totalAcometidasDespachadas: number;

  @ApiProperty({ type: [DispatchedRouteSummaryResponseDto] })
  rutasDespachadas: DispatchedRouteSummaryResponseDto[];
}

export class ReassignRouteSegmentResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 46 })
  nuevaAsignacionId: number;

  @ApiProperty({ example: 45 })
  asignacionOrigenId: number;

  @ApiProperty({ example: 78 })
  prediosTransferidos: number;

  @ApiProperty({ example: 'Segmento pendiente reasignado exitosamente.' })
  message: string;
}

export class ResolvedRouteResponseDto {
  @ApiProperty({ example: 1 })
  idRuta: number;

  @ApiProperty({ example: 'SEC01-R01' })
  codigoRuta: string;

  @ApiProperty({ example: 'Sector 1 - Ruta 1' })
  nombreRuta: string;

  @ApiProperty({ example: 1 })
  sectorId: number;

  @ApiProperty({
    example: 'POINT_IN_POLYGON',
    enum: ['POINT_IN_POLYGON', 'NEAREST_CENTROID_KNN', 'SECTOR_FALLBACK'],
  })
  metodoResolucion: string;

  @ApiProperty({ example: 0.0, description: 'Distancia en metros al polígono (0 si está contenido)' })
  distanciaMetros: number;

  @ApiProperty({ example: 159, description: 'Nuevo orden sugerido si se inserta en esta ruta' })
  ordenSugerido: number;
}

export class OptimizeRouteSequenceResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 1 })
  idRuta: number;

  @ApiProperty({ example: 184 })
  totalReordenadas: number;

  @ApiProperty({ example: 2415.5 })
  distanciaTotalCaminadaMetros: number;

  @ApiProperty({ example: 'Ruta 1 reordenada exitosamente.' })
  message: string;
}

export class LecturistDailyKpiResponseDto {
  @ApiProperty({ example: 'c3a2f8b0-8c29-4d69-a1d2-092931481234' })
  usuarioId: string;

  @ApiProperty({ example: '2026-11-03' })
  fecha: string;

  @ApiProperty({ example: 2 })
  rutasAsignadas: number;

  @ApiProperty({ example: 340 })
  totalPrediosAsignados: number;

  @ApiProperty({ example: 285 })
  totalPrediosLeidos: number;

  @ApiProperty({ example: 15 })
  totalNovedades: number;

  @ApiProperty({ example: 40 })
  totalPendientes: number;

  @ApiProperty({ example: 88.24 })
  porcentajeEfectividad: number;

  @ApiPropertyOptional({ example: '2026-11-03T08:15:22.000Z' })
  horaPrimeraLectura?: string | null;

  @ApiPropertyOptional({ example: '2026-11-03T13:42:10.000Z' })
  horaUltimaLectura?: string | null;
}
