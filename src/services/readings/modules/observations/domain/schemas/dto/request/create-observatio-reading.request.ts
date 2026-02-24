import { ApiProperty } from '@nestjs/swagger';

export class CreateObservationReadingRequest {
  @ApiProperty({
    example: 1,
    description: 'Id of the reading',
    required: true,
  })
  readingId: number;

  @ApiProperty({
    example: 'Observation Title',
    description: 'Title of the observation',
    required: true,
  })
  observationTitle: string;

  @ApiProperty({
    example: 'Observation Details',
    description: 'Details of the observation',
    required: true,
  })
  observationDetails: string;

  constructor(
    readingId: number,
    observationTitle: string,
    observationDetails: string,
  ) {
    this.readingId = readingId;
    this.observationTitle = observationTitle;
    this.observationDetails = observationDetails;
  }
}
