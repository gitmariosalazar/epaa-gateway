import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'crypto';

export class CreateInspectionInvoiceRequest {
  @ApiProperty({
    description: 'The ID of the request associated with the inspection invoice',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
    required: true,
  })
  requestId!: string;
  @ApiProperty({
    description: 'The invoice number for the inspection invoice',
    example: 'INV-001',
    type: String,
    required: true,
  })
  invoiceNumber!: string;
  @ApiProperty({
    description: 'The concept ID for the inspection invoice',
    example: 1,
    type: Number,
    required: true,
  })
  conceptId!: number;
  @ApiProperty({
    description: 'The amount for the inspection invoice',
    example: 100.5,
    type: Number,
    required: true,
  })
  amount!: number;
  @ApiProperty({
    description: 'The expiration date for the inspection invoice',
    example: '2023-12-31T23:59:59Z',
    type: String,
    format: 'date-time',
    required: true,
  })
  expirationDate!: Date;
  @ApiProperty({
    description: 'The payment method for the inspection invoice',
    example: 'Credit Card',
    type: String,
  })
  paymentMethod?: string;
  @ApiProperty({
    description: 'The payment reference for the inspection invoice',
    example: 'ABC123',
    type: String,
  })
  paymentReference?: string;
  @ApiProperty({
    description: 'The proof of payment for the inspection invoice',
    example: 'receipt.pdf',
    type: String,
  })
  proofOfPayment?: string;
  @ApiProperty({
    description:
      'The ID of the collector associated with the inspection invoice',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  collectorId?: UUID;
}
