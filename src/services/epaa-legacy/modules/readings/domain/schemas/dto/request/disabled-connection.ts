import { ApiProperty } from '@nestjs/swagger';

// UPDATE AP_LECTURAS SET Novedad = 'SUSPENDIDO', observacion = 'TEST DE SUSPENSION' WHERE Cod_ingreso = 2579176 AND Sector = 14 AND Cuenta = 293 AND Anio = 2026 AND Mes = 'NOVIEMBRE';
export class DisabledConnectionRequest {
  incomeCode!: number;
  @ApiProperty({
    description: 'Sector',
    type: Number,
    example: 14,
  })
  sector!: number;
  @ApiProperty({
    description: 'Account',
    type: Number,
    example: 293,
  })
  account!: number;

  year!: number;

  month!: string;
  @ApiProperty({
    description: 'Description',
    type: String,
    example: 'TEST DE SUSPENSION',
  })
  description!: string;
  @ApiProperty({
    description: 'State',
    type: String,
    example: 'SUSPENDIDO',
  })
  state!: 'SUSPENDIDO' | 'NORMAL';
}
