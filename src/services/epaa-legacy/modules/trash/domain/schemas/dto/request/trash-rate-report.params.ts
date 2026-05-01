import { ApiProperty } from '@nestjs/swagger';

export class TrashRateReportParams {
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Start date in ISO format',
    example: '2026-01-01',
  })
  startDate: string;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'End date in ISO format',
    example: '2026-01-01',
  })
  endDate: string;

  @ApiProperty({
    type: 'number',
    description: 'Number of records to retrieve (top debtors)',
    example: 10,
    required: false,
  })
  top: number;

  @ApiProperty({
    type: 'number',
    description: 'Number of rows to return (pagination)',
    example: 100,
    required: false,
  })
  limit: number;

  @ApiProperty({
    type: 'number',
    description: 'Number of rows to skip (pagination)',
    example: 0,
    required: false,
  })
  offset: number;

  @ApiProperty({
    type: 'string',
    description:
      "Diagnostic filter for audit report. Use 'DIFFERENT_AND_NO_RECORD' to get records where calculated trash rate differs from valor record by at least 0.01 or there is no valor record, or 'ALL' to get all records.",
    example: 'DIFFERENT_AND_NO_RECORD',
    required: true,
  })
  diagnosticFilter: 'DIFFERENT_AND_NO_RECORD' | 'ALL';
}
