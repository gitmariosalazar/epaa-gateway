import { ApiProperty } from "@nestjs/swagger";

export class CreateObservationConnectionRequest {
  @ApiProperty(
    {
      description: 'The ID of the observation',
      example: 1,
      required: true,
    },
  )
  observationId: number;

  @ApiProperty(
    {
      description: 'The ID of the connection',
      example: 'connection-1',
      required: true,
    },
  )
  connectionId: string;
  @ApiProperty(
    {
      description: 'The title of the observation',
      example: 'Observation Title',
      required: true,
    },
  )
  observationTitle: string;

  @ApiProperty(
    {
      description: 'The details of the observation',
      example: 'Observation Details',
    },
  )
  observationDetails: string;

  constructor(
    observationId: number,
    connectionId: string,
    observationTitle: string,
    observationDetails: string,
  ) {
    this.observationId = observationId;
    this.connectionId = connectionId;
    this.observationTitle = observationTitle;
    this.observationDetails = observationDetails;
  }
}