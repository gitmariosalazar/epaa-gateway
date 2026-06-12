import { ApiProperty } from '@nestjs/swagger';

export class AddWorkOrderAttachmentRequest {
  @ApiProperty({
    example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
    description: 'Work order ID',
  })
  workOrderId!: string;

  @ApiProperty({ example: 'zanja_reparada.jpg', description: 'File name' })
  fileName!: string;

  @ApiProperty({ example: 'image/jpeg', description: 'File MIME type' })
  fileType!: string;

  @ApiProperty({
    example: 'https://dev.sigepaa-aa.com:8443/123456.jpg',
    description: 'Public file URL',
  })
  fileUrl!: string;

  @ApiProperty({
    example: 'b2c3d4e5-f6a7-4b6c-9d8e-1f2a3b4c5d6e',
    description: 'User who created the record',
  })
  createdByUserId!: string;
}
