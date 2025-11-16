import { ApiProperty } from "@nestjs/swagger";

export class CreateWorkOrderObservationRequest {
  @ApiProperty({
    description: 'ID of the work order',
    type: Number,
    example: 1,
  })
  workOrderId: number;
  @ApiProperty({
    description: 'Title of the observation',
    type: String,
    example: 'Initial Inspection',
  })
  observationTitle: string;
  @ApiProperty({
    description: 'Details of the observation',
    type: String,
    example: 'The initial inspection revealed no issues.',
  })
  observationDetails: string;

  constructor(
    workOrderId: number,
    observationTitle: string,
    observationDetails: string,
  ) {
    this.workOrderId = workOrderId;
    this.observationTitle = observationTitle;
    this.observationDetails = observationDetails;
  }
}
