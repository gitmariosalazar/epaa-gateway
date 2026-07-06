import { ApiProperty } from '@nestjs/swagger';

/**
 * Multipart form-data DTO para subir adjuntos a una OT.
 * El campo `files` acepta uno o varios archivos (máx. 10); el gateway guarda
 * cada uno en disco y envía un comando Kafka independiente por archivo.
 */
export class AddWorkOrderAttachmentRequest {
  @ApiProperty({
    example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
    description: 'Work order ID',
  })
  workOrderId!: string;

  @ApiProperty({
    example: 'b2c3d4e5-f6a7-4b6c-9d8e-1f2a3b4c5d6e',
    description: 'User who created the record',
  })
  createdByUserId!: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description:
      'Archivos adjuntos (mín. 1, máx. 10) — cualquier tipo MIME aceptado (imagen, PDF, Word, Excel, ZIP, etc.).',
  })
  files!: Express.Multer.File[];
}
