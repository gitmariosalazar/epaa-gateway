import { ApiProperty } from "@nestjs/swagger";

export class CreateWorkOrderObservationRequest {
  @ApiProperty({ example: 1, description: 'Identifier of the work order', type: Number })
  workOrderId: number;
  @ApiProperty({ example: 1, description: 'Identifier of the observation', type: Number })
  observationId: number;

  constructor(
    workOrderId: number,
    observationId: number,
  ) {
    this.workOrderId = workOrderId;
    this.observationId = observationId;
  }
}