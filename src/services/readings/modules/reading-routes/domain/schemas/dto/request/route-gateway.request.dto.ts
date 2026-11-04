import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class BatchMorningDispatchRequestDto {
  @ApiPropertyOptional({ description: 'ID de la zona comercial/hidráulica', example: 1 })
  @IsOptional()
  @IsInt()
  zonaId?: number;

  @ApiPropertyOptional({ description: 'ID del sector comercial/hidráulico', example: 1 })
  @IsOptional()
  @IsInt()
  sectorId?: number;

  @ApiProperty({ description: 'Periodo de lectura en formato YYYY-MM', example: '2026-11' })
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'El periodo debe tener el formato YYYY-MM (ej. 2026-11)',
  })
  periodo: string;

  @ApiProperty({ description: 'Fecha programada de ejecución en campo (YYYY-MM-DD)', example: '2026-11-03' })
  @IsDateString()
  @IsNotEmpty()
  fechaProgramada: string;

  @ApiProperty({
    description: 'Lista de UUIDs de lecturistas operativos disponibles para la jornada',
    example: [
      'c3a2f8b0-8c29-4d69-a1d2-092931481234',
      'b2e1f4a9-7b18-3c58-9a01-182736495821',
    ],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  lecturistaIds: string[];

  @ApiPropertyOptional({ description: 'Observaciones generales del despacho matutino' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class AssignSingleRouteRequestDto {
  @ApiProperty({ description: 'ID de la ruta a asignar', example: 1 })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  rutaId: number;

  @ApiProperty({ description: 'UUID del usuario lecturista asignado', example: 'c3a2f8b0-8c29-4d69-a1d2-092931481234' })
  @IsUUID('4')
  @IsNotEmpty()
  usuarioId: string;

  @ApiProperty({ description: 'Periodo de lectura en formato YYYY-MM', example: '2026-11' })
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'El periodo debe tener el formato YYYY-MM',
  })
  periodo: string;

  @ApiProperty({ description: 'Fecha programada de ejecución (YYYY-MM-DD)', example: '2026-11-03' })
  @IsDateString()
  @IsNotEmpty()
  fechaProgramada: string;
}

export class ReassignRouteSegmentRequestDto {
  @ApiProperty({ description: 'ID de la asignación original que tiene predios pendientes', example: 45 })
  @IsInt()
  @IsNotEmpty()
  asignacionId: number;

  @ApiProperty({
    description: 'UUID del nuevo lecturista que asumirá los predios pendientes',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @IsUUID('4')
  @IsNotEmpty()
  nuevoUsuarioId: string;

  @ApiProperty({
    description: 'Justificación operativa de la transferencia en campo',
    example: 'Avería mecánica en motocicleta de operador titular. Refuerzo de cuadrilla.',
  })
  @IsString()
  @MinLength(5)
  motivo: string;
}

export class ResolveRouteRequestDto {
  @ApiProperty({ description: 'Latitud WGS84 del medidor', example: 0.331589 })
  @IsLatitude()
  latitud: number;

  @ApiProperty({ description: 'Longitud WGS84 del medidor', example: -78.221085 })
  @IsLongitude()
  longitud: number;

  @ApiPropertyOptional({ description: 'Sector comercial si ya se conoce (ej: 1)', example: 1 })
  @IsOptional()
  @IsInt()
  sector?: number;

  @ApiPropertyOptional({ description: 'ID de acometida si ya existe en catastro', example: '1-63' })
  @IsOptional()
  @IsString()
  acometidaId?: string;
}

export class InsertConnectionIntoRouteRequestDto {
  @ApiProperty({ description: 'ID de la ruta destino', example: 1 })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  idRuta: number;

  @ApiProperty({ description: 'Identificador único de la acometida', example: '1-315' })
  @IsString()
  @IsNotEmpty()
  acometidaId: string;

  @ApiPropertyOptional({
    description: 'Posición ordinal sugerida en el recorrido (si es omitida se añade al final)',
    example: 45,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  ordenSugerido?: number;

  @ApiPropertyOptional({
    description: 'Lado de la calle',
    enum: ['IZQUIERDA', 'DERECHA', 'CENTRO'],
    example: 'DERECHA',
  })
  @IsOptional()
  @IsIn(['IZQUIERDA', 'DERECHA', 'CENTRO'])
  ladoCalle?: string;

  @ApiPropertyOptional({
    description: 'Instrucción o advertencia de acceso para el lecturista',
    example: 'Medidor detrás de la puerta metálica. Timbre lateral.',
  })
  @IsOptional()
  @IsString()
  instruccionAcceso?: string;
}

export class OptimizeRouteSequenceRequestDto {
  @ApiPropertyOptional({
    description: 'ID de la acometida por la cual iniciar el recorrido ordenado',
    example: '1-10',
  })
  @IsOptional()
  @IsString()
  acometidaInicio?: string;
}

export class SingleMobileReadingItemDto {
  @ApiProperty({ example: 1045, description: 'ID del detalle de avance' })
  @IsInt()
  @IsNotEmpty()
  idDetalleAvance: number;

  @ApiProperty({ example: '1-63', description: 'Código de acometida' })
  @IsString()
  @IsNotEmpty()
  acometidaId: string;

  @ApiProperty({ example: 452.8, description: 'Valor numérico de la lectura' })
  @IsNumber()
  @IsNotEmpty()
  lecturaActual: number;

  @ApiProperty({ example: '2026-11-03T09:42:15.000Z', description: 'Timestamp ISO de la captura' })
  @IsDateString()
  @IsNotEmpty()
  fechaHoraCaptura: string;

  @ApiPropertyOptional({ example: 0.331589, description: 'Latitud GPS del lecturista' })
  @IsOptional()
  @IsNumber()
  latitudGps?: number;

  @ApiPropertyOptional({ example: -78.221085, description: 'Longitud GPS del lecturista' })
  @IsOptional()
  @IsNumber()
  longitudGps?: number;

  @ApiPropertyOptional({ example: 'MEDIDOR_EMPAÑADO', description: 'Código o texto de la novedad detectada' })
  @IsOptional()
  @IsString()
  novedadId?: string;

  @ApiPropertyOptional({ example: 'https://storage.sigepaa.epaa.gob.ec/fotos-lecturas/2026-11/1-63.webp' })
  @IsOptional()
  @IsString()
  fotoEvidenciaUrl?: string;

  @ApiPropertyOptional({ example: 'Perro suelto impidió acercarse al medidor' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class SyncMobileReadingsBatchRequestDto {
  @ApiProperty({ example: 12, description: 'ID de la asignación' })
  @IsInt()
  @IsNotEmpty()
  asignacionId: number;

  @ApiProperty({ type: [SingleMobileReadingItemDto], description: 'Colección de lecturas capturadas offline' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleMobileReadingItemDto)
  lecturas: SingleMobileReadingItemDto[];
}

export class FindReadingRoutesQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por sector comercial/hidráulico (1-79)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sectorId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por estado activo/inactivo', example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activa?: boolean;

  @ApiPropertyOptional({ description: 'Búsqueda de texto por código o nombre de ruta', example: 'SEC01' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Número de página para paginación', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ description: 'Cantidad de elementos por página', example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

export class GetMyAssignedRoutesQueryDto {
  @ApiPropertyOptional({
    description: 'Fecha programada de lectura (YYYY-MM-DD)',
    example: '2026-11-04',
  })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional({
    description: 'Periodo de lectura en formato YYYY-MM',
    example: '2026-11',
  })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'El periodo debe tener el formato YYYY-MM (ej. 2026-11)',
  })
  periodo?: string;
}

