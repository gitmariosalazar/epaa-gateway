import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkOrderFromIncidentRequest {
  @ApiProperty({ example: 'RPT-EPAA-000001', description: 'Incident code to generate the work order from' })
  incidentCode!: string;

  @ApiProperty({
    example: '1c099719-74d1-419b-a3d8-5b4fc8be2c9e',
    required: false,
    description: 'Optional UUID of the technician to assign the work order immediately',
  })
  userIdAssignee?: string;
}
