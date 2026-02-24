import { ApiProperty } from '@nestjs/swagger';

export class CalculateReadingValueParams {
  @ApiProperty({
    example: '123456789012345678',
    description: 'Cadastral key',
  })
  cadastralKey: string;
  @ApiProperty({
    example: 123,
    description: 'Consumption in m3',
  })
  consumptionM3: number;
}
