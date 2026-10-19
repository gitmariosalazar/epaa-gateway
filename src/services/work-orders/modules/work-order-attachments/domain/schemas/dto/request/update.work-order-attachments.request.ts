import { ApiProperty } from '@nestjs/swagger';

export class UpdateWorkOrderAttachmentsRequest {
  @ApiProperty({
    example: 1,
    description: 'ID of the associated work order',
    required: true,
    type: Number,
  })
  workOrderId: number;
  @ApiProperty({
    example: 'attachment.pdf',
    description: 'Name of the attachment file',
    required: false,
    type: String,
  })
  fileName?: string;
  @ApiProperty({
    example: 'application/pdf',
    description: 'MIME type of the attachment file',
    required: false,
    type: String,
  })
  fileType?: string;
  @ApiProperty({
    example: 'https://example.com/attachment.pdf',
    description: 'URL where the attachment file is stored',
    required: false,
    type: String,
  })
  fileUrl?: string;
  @ApiProperty({
    example: 'TRABAJO_TERMINADO',
    description: 'Evidence stage code',
    required: false,
    type: String,
  })
  evidenceStageCode?: string;

  constructor(
    workOrderId: number,
    fileName?: string,
    fileType?: string,
    fileUrl?: string,
    evidenceStageCode?: string,
  ) {
    this.workOrderId = workOrderId;
    this.fileName = fileName;
    this.fileType = fileType;
    this.fileUrl = fileUrl;
    this.evidenceStageCode = evidenceStageCode;
  }
}
