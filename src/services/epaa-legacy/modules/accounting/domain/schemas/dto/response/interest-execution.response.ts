import { ApiProperty } from '@nestjs/swagger';

export class InterestExecutionResponseDto {
  @ApiProperty({ description: 'Timestamp of execution', example: '2026-11-03T00:00:00.000Z' })
  executedAt!: Date;

  @ApiProperty({ description: 'Execution status', example: true })
  success!: boolean;

  @ApiProperty({ description: 'Execution outcome message', example: 'Procedimiento sp_ActualizarInteresesDiarios ejecutado exitosamente.' })
  message!: string;
}
