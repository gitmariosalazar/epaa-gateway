import { ApiProperty } from "@nestjs/swagger";

export class CreatePropertyRequest {
  @ApiProperty(
    { example: 'CAT-98765', description: 'Cadastral key of the property', type: String }
  )
  propertyCadastralKey: string;

  @ApiProperty(
    { example: 'CLIENT-12345', description: 'Client ID associated with the property', type: String }
  )
  propertyClientId: string;

  @ApiProperty(
    { example: 'Main St', description: 'Alleyway where the property is located', type: String }
  )
  propertyAlleyway: string;

  @ApiProperty(
    { example: 'Sector 1', description: 'Sector where the property is located', type: String }
  )
  propertySector: string;

  @ApiProperty(
    { example: '123 Main St', description: 'Address of the property', type: String }
  )
  propertyAddress: string;
  @ApiProperty(
    { example: 500.0, description: 'Land area of the property in square meters', type: Number }
  )
  propertyLandArea: number;

  @ApiProperty(
    { example: 300.0, description: 'Construction area of the property in square meters', type: Number }
  )
  propertyConstructionArea: number;

  @ApiProperty(
    { example: 100000.0, description: 'Land value of the property in currency units', type: Number }
  )
  propertyLandValue: number;

  @ApiProperty(
    { example: 150000.0, description: 'Construction value of the property in currency units', type: Number }
  )
  propertyConstructionValue: number;

  @ApiProperty(
    { example: 200000.0, description: 'Commercial value of the property in currency units', type: Number }
  )
  propertyCommercialValue: number;

  @ApiProperty(
    { example: 12.345678, description: 'Longitude of the property', type: Number }
  )
  longitude: number;

  @ApiProperty(
    { example: 98.765432, description: 'Latitude of the property', type: Number }
  )
  latitude: number;

  @ApiProperty(
    { example: 'REF-12345', description: 'Reference ID of the property', type: String }
  )
  propertyReference: string;

  @ApiProperty(
    { example: 100.0, description: 'Altitude of the property in meters', type: Number }
  )
  propertyAltitude: number;

  @ApiProperty(
    { example: 0.99, description: 'Precision of the property location', type: Number }
  )
  propertyPrecision: number;
  @ApiProperty(
    { example: 1, description: 'Type ID of the property', type: Number }
  )
  propertyTypeId: number;

  constructor(
    propertyCadastralKey: string,
    propertyClientId: string,
    propertyAlleyway: string,
    propertySector: string,
    propertyAddress: string,
    propertyLandArea: number,
    propertyConstructionArea: number,
    propertyLandValue: number,
    propertyConstructionValue: number,
    propertyCommercialValue: number,
    longitude: number,
    latitude: number,
    propertyReference: string,
    propertyAltitude: number,
    propertyPrecision: number,
    propertyTypeId: number,
  ) {
    this.propertyCadastralKey = propertyCadastralKey;
    this.propertyClientId = propertyClientId;
    this.propertyAlleyway = propertyAlleyway;
    this.propertySector = propertySector;
    this.propertyAddress = propertyAddress;
    this.propertyLandArea = propertyLandArea;
    this.propertyConstructionArea = propertyConstructionArea;
    this.propertyLandValue = propertyLandValue;
    this.propertyConstructionValue = propertyConstructionValue;
    this.propertyCommercialValue = propertyCommercialValue;
    this.longitude = longitude;
    this.latitude = latitude;
    this.propertyReference = propertyReference;
    this.propertyAltitude = propertyAltitude;
    this.propertyPrecision = propertyPrecision;
    this.propertyTypeId = propertyTypeId;
  }
}