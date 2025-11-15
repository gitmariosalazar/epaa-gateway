import { ApiProperty } from "@nestjs/swagger";

export class UpdateWorkOrderObservationRequest {
  @ApiProperty({ example: 1, description: 'Identifier of the work order', type: Number, required: false })
  workOrderId?: number;
  @ApiProperty({ example: 1, description: 'Identifier of the observation', type: Number, required: false })
  observationId?: number;

  constructor(
    workOrderId?: number,
    observationId?: number,
  ) {
    this.workOrderId = workOrderId;
    this.observationId = observationId;
  }
}