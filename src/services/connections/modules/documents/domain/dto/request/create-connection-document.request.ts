import { ApiProperty } from '@nestjs/swagger';

export class CreateConnectionDocumentRequest {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier for the connection request',
    required: true,
    type: String,
  })
  requestId!: string;

  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the document type',
    required: true,
    type: Number,
  })
  documentTypeId!: Number;

  @ApiProperty({
    example: 'https://storage.example.com/documents/doc123.pdf',
    description:
      'URL where the document is stored (optional if fileBase64 is provided)',
    required: false,
    type: String,
  })
  fileUrl?: string;

  @ApiProperty({
    example: 'data:application/pdf;base64,JVBERi0xLjcKJcTl8uXr...',
    description:
      'Base64 content of the file to upload. Supports any file type.',
    required: false,
    type: String,
  })
  fileBase64?: string;

  @ApiProperty({
    example: 'certificate.pdf',
    description: 'Original file name',
    required: true,
    type: String,
  })
  originalName!: string;

  @ApiProperty({
    example: 'application/pdf',
    description:
      'MIME type of the document (auto-detected when fileBase64 is provided)',
    required: false,
    type: String,
  })
  mimeType?: string;

  @ApiProperty({
    example: 2048576,
    description:
      'File size in bytes (auto-generated when fileBase64 is provided)',
    required: false,
    type: Number,
  })
  sizeInBytes?: number;

  @ApiProperty({
    example: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    description:
      'SHA256 hash of the file (auto-generated when fileBase64 is provided)',
    required: false,
    type: String,
  })
  hashSha256?: string;

  @ApiProperty({
    example: 'VALIDO',
    enum: ['VALIDO', 'INVALIDO', 'PENDIENTE'],
    description: 'Validation status of the document',
    required: true,
  })
  validationStatus!: string;

  @ApiProperty({
    example: 'Document is valid and properly signed',
    description: 'Observations or comments about the document',
    required: false,
    type: String,
  })
  observation?: string;

  /*
  @ApiProperty({
    example: 'validator-001',
    description: 'Identifier of the validator who reviewed the document',
    required: false,
    type: String,
  })
  validatorId?: string;
  */
}
