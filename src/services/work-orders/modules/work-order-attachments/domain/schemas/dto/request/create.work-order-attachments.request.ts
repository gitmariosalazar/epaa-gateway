import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkOrderAttachmentsRequest {
  @ApiProperty({
    example: 1,
    description: 'ID of the associated work order',
    required: true,
    type: String,
  })
  workOrderId: string;
  @ApiProperty({
    example: 'attachment.pdf',
    description: 'Name of the attachment file',
    required: true,
    type: String,
  })
  fileName: string;
  @ApiProperty({
    example: 'application/pdf',
    description: 'MIME type of the attachment file',
    required: true,
    type: String,
  })
  fileType: string;
  @ApiProperty({
    example: 'https://example.com/attachment.pdf',
    description: 'URL where the attachment file is stored',
    required: true,
    type: String,
  })
  fileUrl: string;

  constructor(
    workOrderId: string,
    fileName: string,
    fileType: string,
    fileUrl: string,
  ) {
    this.workOrderId = workOrderId;
    this.fileName = fileName;
    this.fileType = fileType;
    this.fileUrl = fileUrl;
  }
}
