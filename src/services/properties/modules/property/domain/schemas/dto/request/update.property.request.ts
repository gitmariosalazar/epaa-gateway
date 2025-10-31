import { ApiProperty } from "@nestjs/swagger";

export class UpdatePropertyRequest {
  @ApiProperty({ description: 'Cadastral key of the property', example: 'ABC123456789' })
  propertyCadastralKey?: string;

  @ApiProperty({ description: 'Client ID associated with the property', example: 'CLIENT-12345' })
  propertyClientId?: string;

  @ApiProperty({ description: 'Alleyway where the property is located', example: 'Main St' })
  propertyAlleyway?: string;

  @ApiProperty({ description: 'Sector where the property is located', example: 'Sector 1' })
  propertySector?: string;

  @ApiProperty({ description: 'Address of the property', example: '123 Main St' })
  propertyAddress?: string;

  @ApiProperty({ description: 'Land area of the property in square meters', example: 500.0 })
  propertyLandArea?: number;

  @ApiProperty({ description: 'Construction area of the property in square meters', example: 300.0 })
  propertyConstructionArea?: number;

  @ApiProperty({ description: 'Land value of the property in currency units', example: 100000.0 })
  propertyLandValue?: number;

  @ApiProperty({ description: 'Construction value of the property in currency units', example: 150000.0 })
  propertyConstructionValue?: number;

  @ApiProperty({ description: 'Commercial value of the property in currency units', example: 200000.0 })
  propertyCommercialValue?: number;

  @ApiProperty({ description: 'Longitude of the property', example: 12.345678 })
  longitude?: number;

  @ApiProperty({ description: 'Latitude of the property', example: 98.765432 })
  latitude?: number;

  @ApiProperty({ description: 'Reference ID of the property', example: 'REF-12345' })
  propertyReference?: string;

  @ApiProperty({ description: 'Altitude of the property in meters', example: 100.0 })
  propertyAltitude?: number;

  @ApiProperty({ description: 'Precision of the property location', example: 0.99 })
  propertyPrecision?: number;

  @ApiProperty({ description: 'Type ID of the property', example: 1 })
  propertyTypeId?: number;

  constructor(
    propertyCadastralKey?: string,
    propertyClientId?: string,
    propertyAlleyway?: string,
    propertySector?: string,
    propertyAddress?: string,
    propertyLandArea?: number,
    propertyConstructionArea?: number,
    propertyLandValue?: number,
    propertyConstructionValue?: number,
    propertyCommercialValue?: number,
    longitude?: number,
    latitude?: number,
    propertyReference?: string,
    propertyAltitude?: number,
    propertyPrecision?: number,
    propertyTypeId?: number,
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