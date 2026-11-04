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

  @ApiProperty({
    example: 'Despacho matutino ejecutado exitosamente para 14 rutas.',
  })
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

  @ApiProperty({
    example: 0.0,
    description: 'Distancia en metros al polígono (0 si está contenido)',
  })
  distanciaMetros: number;

  @ApiProperty({
    example: 159,
    description: 'Nuevo orden sugerido si se inserta en esta ruta',
  })
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

export class MobileAssignedRouteResponseDto {
  @ApiProperty({ example: 12, description: 'ID único de la asignación' })
  idAsignacion: number;

  @ApiProperty({ example: 5, description: 'ID de la ruta de lectura' })
  rutaId: number;

  @ApiProperty({ example: 'SEC01-R01', description: 'Código único de la ruta' })
  codigoRuta: string;

  @ApiProperty({ example: 'Sector 1 - San José', description: 'Nombre de la ruta' })
  nombreRuta: string;

  @ApiPropertyOptional({ example: 1, description: 'Sector comercial / hidráulico' })
  sector?: number;

  @ApiProperty({ example: 'c3a2f8b0-8c29-4d69-a1d2-092931481234', description: 'UUID del lecturista asignado' })
  usuarioId: string;

  @ApiPropertyOptional({ example: 'Carlos Andrés Mendoza', description: 'Nombre completo del lecturista' })
  nombreLecturista?: string;

  @ApiPropertyOptional({ example: '1001600780', description: 'Cédula o identificación del lecturista' })
  identificacionUsuario?: string;

  @ApiProperty({ example: '2026-11', description: 'Periodo de lectura (YYYY-MM)' })
  periodoMes: string;

  @ApiProperty({ example: '2026-11-04', description: 'Fecha programada de lectura' })
  fechaProgramada: string;

  @ApiPropertyOptional({ example: '2026-11-04T08:15:00.000Z', description: 'Fecha/hora de inicio de lectura' })
  fechaInicio?: string | null;

  @ApiPropertyOptional({ example: null, description: 'Fecha/hora de cierre de lectura' })
  fechaCierre?: string | null;

  @ApiProperty({
    example: 'ASIGNADA',
    enum: ['ASIGNADA', 'EN_PROCESO', 'PAUSADA', 'COMPLETADA', 'REASIGNADA'],
    description: 'Estado actual de la asignación',
  })
  estado: string;

  @ApiProperty({ example: 158, description: 'Total de predios/acometidas en la ruta' })
  totalPredios: number;

  @ApiProperty({ example: 45, description: 'Predios leídos exitosamente' })
  prediosLeidos: number;

  @ApiProperty({ example: 3, description: 'Predios con novedad registrada' })
  prediosConNovedad: number;

  @ApiProperty({ example: 110, description: 'Predios aún pendientes' })
  prediosPendientes: number;

  @ApiProperty({ example: 30.38, description: 'Porcentaje de avance actual (0 - 100)' })
  porcentajeAvance: number;

  @ApiProperty({ example: false, description: 'Indica si es una reasignación en caliente' })
  esReasignacion: boolean;

  @ApiPropertyOptional({ example: null, description: 'Observación o motivo de reasignación' })
  motivoReasignacion?: string | null;
}

