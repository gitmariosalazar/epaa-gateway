import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'crypto';

export class UpdateInspectionInvoiceRequest {
  @ApiProperty({
    description: 'The ID of the inspection invoice to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
    required: true,
  })
  invoiceId!: string;
  @ApiProperty({
    description: 'The ID of the request associated with the inspection invoice',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  requestId?: string;
  @ApiProperty({
    description: 'The invoice number for the inspection invoice',
    example: 'INV-001',
    type: String,
  })
  invoiceNumber?: string;
  @ApiProperty({
    description: 'The concept ID for the inspection invoice',
    example: 1,
    type: Number,
  })
  conceptId?: number;
  @ApiProperty({
    description: 'The amount for the inspection invoice',
    example: 100.5,
    type: Number,
  })
  amount?: number;
  @ApiProperty({
    description: 'The expiration date for the inspection invoice',
    example: '2024-12-31',
    type: String,
  })
  expirationDate?: Date;

  @ApiProperty({
    description: 'The payment date for the inspection invoice',
    example: '2024-12-31',
    type: String,
  })
  paymentDate?: Date;
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
