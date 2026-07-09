import { ApiProperty } from '@nestjs/swagger';

export class UpdatePositionRequest {
  @ApiProperty({
    description: 'Name of the position (cargo)',
    example: 'Inspector de Redes Senior',
    required: false,
    type: String,
  })
  name?: string;

  @ApiProperty({
    description: 'Hierarchical level (1 = top management, 3 = operational)',
    example: 2,
    required: false,
    type: Number,
  })
  levelJerarchy?: number;

  @ApiProperty({
    description: 'Description of the position responsibilities',
    example: 'Supervisión avanzada de conexiones y detección de fugas',
    required: false,
    type: String,
  })
  description?: string;

  @ApiProperty({
    description: 'Indicates if the position is active',
    example: true,
    required: false,
    type: Boolean,
  })
  active?: boolean;
}
