import { ApiProperty } from "@nestjs/swagger";

export class CreatePhotoConnectionRequest {
  @ApiProperty({
    example: 1, description: 'ID of the associated connection',
    required: true,
    type: Number
  })
  connectionId: string;

  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'URL of the photo',
    required: true,
    type: String
  })
  photoUrl: string;

  @ApiProperty({
    example: 'Photo taken during site inspection',
    description: 'Optional description of the photo connection',
    required: false,
    type: String
  })
  description?: string;

  constructor(
    connectionId: string,
    photoUrl: string,
    description?: string
  ) {
    this.connectionId = connectionId;
    this.photoUrl = photoUrl;
    this.description = description;
  }
}