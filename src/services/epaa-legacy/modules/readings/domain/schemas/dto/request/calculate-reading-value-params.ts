import { ApiProperty } from '@nestjs/swagger';

export class CalculateReadingValueParams {
  @ApiProperty({
    example: '14-293',
    description: 'Cadastral key',
    required: true,
    type: String,
  })
  cadastralKey!: string;
  @ApiProperty({
    example: 123,
    description: 'Consumption in m3',
    required: true,
    type: Number,
  })
  consumptionM3!: number;
}
