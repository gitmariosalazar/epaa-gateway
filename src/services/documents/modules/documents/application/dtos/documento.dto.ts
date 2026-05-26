import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type DocumentEstado = 'CARGADO' | 'EN_VALIDACION' | 'APROBADO' | 'RECHAZADO' | 'EXPIRADO';
export type DocumentAcceso = 'PUBLICO' | 'PRIVADO' | 'RESTRINGIDO_ROL';
export type EntityRelationType = 'solicitud' | 'predio' | 'orden_trabajo' | 'acometida' | 'factura' | 'lectura' | 'usuarios';

export class UploadDocumentDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'El archivo físico real a subir (PDF o Imagen)',
  })
  file!: any;

  @ApiProperty({
    description: 'Código identificador del tipo de documento en el catálogo',
    example: 'CEDULA',
  })
  codigoTipoDocumento!: string;

  @ApiPropertyOptional({
    description: 'Nivel de visibilidad y acceso asignado al archivo',
    enum: ['PUBLICO', 'PRIVADO', 'RESTRINGIDO_ROL'],
    default: 'PRIVADO',
  })
  nivelAcceso?: DocumentAcceso;

  @ApiPropertyOptional({
    description: 'Lista de roles del sistema permitidos para acceder (si es restringido)',
    type: [String],
    example: ['ADMIN'],
  })
  rolesPermitidos?: string[];

  @ApiPropertyOptional({
    description: 'Metadatos adicionales en formato de cadena JSON',
    type: String,
    example: '{"observacion": "Carga manual de prueba"}',
  })
  metadatosExtras?: string;

  @ApiPropertyOptional({
    description: 'Entidad de negocio a la que se desea vincular el documento',
    enum: ['solicitud', 'predio', 'orden_trabajo', 'acometida', 'factura', 'lectura', 'usuarios'],
    example: 'predio',
  })
  entityType?: EntityRelationType;

  @ApiPropertyOptional({
    description: 'ID de la entidad de negocio a relacionar',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  entityId?: string | number;
}

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Código identificador del tipo de documento en el catálogo',
    example: 'CEDULA',
  })
  codigoTipoDocumento!: string;

  @ApiProperty({
    description: 'Nombre original del archivo subido por el usuario',
    example: 'documento_identidad.pdf',
  })
  nombreOriginal!: string;

  @ApiProperty({
    description: 'Tamaño del archivo en bytes',
    example: 1048576,
  })
  fileSizeBytes!: number;

  @ApiProperty({
    description: 'Hash SHA-256 criptográfico para validar la integridad del archivo',
    example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  })
  fileHashSha256!: string;

  @ApiPropertyOptional({
    description: 'Nivel de visibilidad y acceso asignado al archivo',
    enum: ['PUBLICO', 'PRIVADO', 'RESTRINGIDO_ROL'],
    default: 'PRIVADO',
  })
  nivelAcceso?: DocumentAcceso;

  @ApiPropertyOptional({
    description: 'Lista de roles del sistema permitidos para acceder (si el nivel es RESTRINGIDO_ROL)',
    type: [String],
    example: ['ADMIN', 'AUDITOR'],
  })
  rolesPermitidos?: string[];

  @ApiPropertyOptional({
    description: 'Metadatos adicionales o información extra relevante en formato JSON',
    type: Object,
    example: { observacion: 'Documentación inicial', version: 1 },
  })
  metadatosExtras?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'UUID del usuario que realiza la carga (se autocompleta desde el token Bearer JWT)',
    example: 'f0e9d8c7-b6a5-4321-8765-abcdef123456',
  })
  uploadedBy?: string;

  @ApiPropertyOptional({
    description: 'Entidad de negocio a la que se desea vincular el documento',
    enum: ['solicitud', 'predio', 'orden_trabajo', 'acometida', 'factura', 'lectura', 'usuarios'],
    example: 'predio',
  })
  entityType?: EntityRelationType;

  @ApiPropertyOptional({
    description: 'ID o Código de la entidad de negocio a relacionar (UUID, integer o varchar)',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  entityId?: string | number;
}

export class AssociateDocumentDto {
  @ApiProperty({
    description: 'Entidad del negocio a la que se vincula el archivo',
    enum: ['solicitud', 'predio', 'orden_trabajo', 'acometida', 'factura', 'lectura', 'usuarios'],
    example: 'factura',
  })
  entityType!: EntityRelationType;

  @ApiProperty({
    description: 'ID de la entidad seleccionada (UUID o número)',
    example: 45091,
  })
  entityId!: string | number;
}

export class UpdateDocumentStateDto {
  @ApiProperty({
    description: 'Nuevo estado de validación asignado por el auditor',
    enum: ['CARGADO', 'EN_VALIDACION', 'APROBADO', 'RECHAZADO', 'EXPIRADO'],
    example: 'APROBADO',
  })
  estado!: DocumentEstado;

  @ApiPropertyOptional({
    description: 'Razón detallada si el estado del documento cambia a RECHAZADO',
    example: 'El archivo PDF no coincide con la cédula del usuario.',
  })
  motivoRechazo?: string;

  @ApiPropertyOptional({
    description: 'UUID del auditor que efectúa la validación (se autocompleta desde el token Bearer JWT)',
    example: 'f0e9d8c7-b6a5-4321-8765-abcdef123456',
  })
  realizadoPor!: string;
}

export class DocumentResponseDto {
  @ApiProperty({
    description: 'UUID único del documento registrado',
    example: '8c7b6a5f-4321-9876-bcde-fedcba654321',
  })
  documento_id!: string;

  @ApiProperty({
    description: 'ID del catálogo del tipo de documento',
    example: 1,
  })
  tipo_documento_id!: number;

  @ApiProperty({
    description: 'Código del tipo de documento',
    example: 'CEDULA',
  })
  codigo_tipo!: string;

  @ApiProperty({
    description: 'Nombre de origen del archivo',
    example: 'documento_identidad.pdf',
  })
  nombre_original!: string;

  @ApiProperty({
    description: 'Proveedor de almacenamiento físico',
    example: 'MINIO',
  })
  storage_provider!: string;

  @ApiProperty({
    description: 'Nombre del bucket o contenedor de almacenamiento',
    example: 'sigepaa-documents',
  })
  storage_bucket!: string;

  @ApiProperty({
    description: 'Ruta física relativa dentro del bucket',
    example: 'documents/CEDULA/2026-05-24/uuid-archivo.pdf',
  })
  storage_path!: string;

  @ApiProperty({
    description: 'Tipo MIME del archivo',
    example: 'application/pdf',
  })
  mime_type!: string;

  @ApiProperty({
    description: 'Tamaño del archivo en bytes',
    example: 1048576,
  })
  file_size_bytes!: number;

  @ApiProperty({
    description: 'Estado de validación del documento',
    enum: ['CARGADO', 'EN_VALIDACION', 'APROBADO', 'RECHAZADO', 'EXPIRADO'],
    example: 'CARGADO',
  })
  estado!: DocumentEstado;

  @ApiProperty({
    description: 'Nivel de acceso configurado',
    enum: ['PUBLICO', 'PRIVADO', 'RESTRINGIDO_ROL'],
    example: 'PRIVADO',
  })
  nivel_acceso!: DocumentAcceso;

  @ApiProperty({
    description: 'Roles del sistema autorizados para acceder',
    type: [String],
    example: [],
  })
  roles_permitidos!: string[];

  @ApiPropertyOptional({
    description: 'Razón de rechazo si aplica',
    example: null,
  })
  motivo_rechazo?: string;

  @ApiProperty({
    description: 'Metadatos adicionales en formato JSON',
    type: Object,
    example: {},
  })
  metadatos_extras!: Record<string, any>;

  @ApiPropertyOptional({
    description: 'UUID del usuario que subió el documento',
    example: 'f0e9d8c7-b6a5-4321-8765-abcdef123456',
  })
  uploaded_by?: string;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2026-05-24T00:00:00.000Z',
  })
  created_at!: Date;

  @ApiPropertyOptional({
    description: 'URL pre-firmada segura y temporal para descargar/visualizar el archivo físico',
    example: 'http://localhost:4007/uploads/sigepaa-documents/documents/CEDULA/...',
  })
  downloadUrl?: string;
}
