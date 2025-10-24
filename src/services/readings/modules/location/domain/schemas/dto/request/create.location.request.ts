import { ApiProperty } from "@nestjs/swagger";

export class CreateLocationRequest {
  @ApiProperty({
    example: -34.6037,
    description: 'Latitude of the location',
    required: true,
    type: Number,
  })
  latitude: number;
  @ApiProperty({
    example: -58.3816,
    description: 'Longitude of the location',
    required: true,
    type: Number,
  })
  longitude: number;
  @ApiProperty({
    example: { description: 'Near the main square' },
    description: 'Additional metadata for the location',
    required: false,
    type: Object,
  })
  metadata?: { [key: string]: any };
  @ApiProperty({
    example: '12-36',
    description: 'Connection ID associated with the location',
    required: true,
    type: String,
  })
  connectionId: string;

  constructor(latitude: number, longitude: number, connectionId: string, metadata?: { [key: string]: any }) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.connectionId = connectionId;
    this.metadata = metadata;
  }
}
