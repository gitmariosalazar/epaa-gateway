import { ApiProperty } from "@nestjs/swagger";

export class CreatePhotoReadingRequest {
  @ApiProperty({
    example: 1, description: 'ID of the associated reading',
    required: true,
    type: Number
  })
  readingId: number;

  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'URL of the photo',
    required: true,
    type: String
  })
  photoUrl: string;

  @ApiProperty({
    example: 'ABC123',
    description: 'Cadastral key associated with the photo reading',
    required: true,
    type: String
  })
  cadastralKey: string;

  @ApiProperty({
    example: 'Photo taken during site inspection',
    description: 'Optional description of the photo reading',
    required: false,
    type: String
  })
  description?: string;

  constructor(
    readingId: number,
    photoUrl: string,
    cadastralKey: string,
    description?: string
  ) {
    this.readingId = readingId;
    this.photoUrl = photoUrl;
    this.cadastralKey = cadastralKey;
    this.description = description;
  }
}