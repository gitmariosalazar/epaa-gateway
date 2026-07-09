import { ApiProperty } from '@nestjs/swagger';

export class CreatePositionRequest {
  @ApiProperty({
    description: 'Name of the position (cargo)',
    example: 'Inspector de Redes',
    required: true,
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Hierarchical level (1 = top management, 3 = operational)',
    example: 3,
    required: true,
    type: Number,
  })
  levelJerarchy: number;

  @ApiProperty({
    description: 'Description of the position responsibilities',
    example: 'Supervisión de conexiones y detección de fugas',
    required: false,
    type: String,
  })
  description?: string;
}
