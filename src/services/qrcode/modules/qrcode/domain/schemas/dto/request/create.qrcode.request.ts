import { ApiProperty } from '@nestjs/swagger';
import { Buffer } from 'buffer';

export class CreateQRCodeRequest {
  @ApiProperty({
    description: 'ID de la acometida asociada al código QR',
    example: 'ACM1234567',
    required: true,
    type: String,
  })
  acometidaId: string;

  constructor(acometidaId: string) {
    this.acometidaId = acometidaId;
  }
}
