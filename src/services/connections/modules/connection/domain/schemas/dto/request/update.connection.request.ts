import { ApiProperty } from "@nestjs/swagger";

export class UpdateConnectionRequest {
  @ApiProperty(
    { example: 'conn-12345', description: 'Unique identifier for the connection', type: String }
  )
  connectionId: string;

  @ApiProperty(
    { example: 'client-67890', description: 'Identifier for the client associated with the connection', type: String }
  )
  clientId: string;

  @ApiProperty(
    { example: 1, description: 'Identifier for the connection rate', type: Number }
  )
  connectionRateId: number;

  @ApiProperty(
    { example: 'Basic', description: 'Name of the connection rate', type: String }
  )
  connectionRateName: string;

  @ApiProperty(
    { example: '123456789', description: 'Meter number for the connection', type: String }
  )
  connectionMeterNumber: string;
  @ApiProperty(
    { example: 'contract-12345', description: 'Contract number for the connection', type: String }
  )
  connectionContractNumber: string;

  @ApiProperty(
    { example: true, description: 'Indicates if the connection has sewerage', type: Boolean }
  )
  connectionSewerage: boolean;

  @ApiProperty(
    { example: true, description: 'Indicates if the connection is active', type: Boolean }
  )
  connectionStatus: boolean;

  @ApiProperty(
    { example: '123 Main St, City, Country', description: 'Address of the connection', type: String }
  )
  connectionAddress: string;

  @ApiProperty(
    { example: '2022-01-01', description: 'Installation date of the connection', type: Date }
  )
  connectionInstallationDate: Date;
  @ApiProperty(
    { example: 4, description: 'Number of people associated with the connection', type: Number }
  )
  connectionPeopleNumber: number;

  @ApiProperty(
    { example: 1, description: 'Zone of the connection', type: Number }
  )
  connectionZone: number;

  @ApiProperty(
    { example: -73.935242, description: 'Longitude of the connection', type: Number }
  )
  longitude: number;

  @ApiProperty(
    { example: 40.730610, description: 'Latitude of the connection', type: Number }
  )
  latitude: number;

  @ApiProperty(
    { example: 'ref-12345', description: 'Reference number for the connection', type: String }
  )
  connectionReference: string;

  @ApiProperty(
    { example: { key: 'value' }, description: 'Metadata for the connection', type: Object }
  )
  ConnectionMetaData: { [key: string]: any };

  @ApiProperty(
    { example: 1000, description: 'Altitude of the connection', type: Number }
  )
  connectionAltitude: number;

  @ApiProperty(
    { example: 100, description: 'Precision of the connection', type: Number }
  )
  connectionPrecision: number;

  @ApiProperty(
    { example: '2022-01-02', description: 'Geolocation date of the connection', type: Date }
  )
  connectionGeolocationDate: Date;

  @ApiProperty({
    example: {
      type: 'Polygon',
      coordinates: [
        [
          [-78.50, -0.25],
          [-78.48, -0.25],
          [-78.48, -0.26],
          [-78.50, -0.26],
          [-78.50, -0.25],
        ],
      ],
    },
    description: 'Geometric zone of the connection (GeoJSON Polygon)',
    required: false,
    type: Object,
  })
  connectionGeometricZone: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  @ApiProperty(
    { example: 'CAT-98765', description: 'Property identifier for the connection', type: String }
  )
  propertyCadastralKey: string;

  @ApiProperty(
    { example: 2, description: 'Zone ID of the connection', type: Number, required: false }
  )
  zoneId: number;

  constructor(
    connectionId: string,
    clientId: string,
    connectionRateId: number,
    connectionRateName: string,
    connectionMeterNumber: string,
    connectionContractNumber: string,
    connectionSewerage: boolean,
    connectionStatus: boolean,
    connectionAddress: string,
    connectionInstallationDate: Date,
    connectionPeopleNumber: number,
    connectionZone: number,
    longitude: number,
    latitude: number,
    connectionReference: string,
    ConnectionMetaData: { [key: string]: any },
    connectionAltitude: number,
    connectionPrecision: number,
    connectionGeolocationDate: Date,
    connectionGeometricZone: {
      type: 'Polygon';
      coordinates: number[][][];
    },
    propertyCadastralKey: string,
    zoneId: number,
  ) {
    this.connectionId = connectionId;
    this.clientId = clientId;
    this.connectionRateId = connectionRateId;
    this.connectionRateName = connectionRateName;
    this.connectionMeterNumber = connectionMeterNumber;
    this.connectionContractNumber = connectionContractNumber;
    this.connectionSewerage = connectionSewerage;
    this.connectionStatus = connectionStatus;
    this.connectionAddress = connectionAddress;
    this.connectionInstallationDate = connectionInstallationDate;
    this.connectionPeopleNumber = connectionPeopleNumber;
    this.connectionZone = connectionZone;
    this.longitude = longitude;
    this.latitude = latitude;
    this.connectionReference = connectionReference;
    this.ConnectionMetaData = ConnectionMetaData;
    this.connectionAltitude = connectionAltitude;
    this.connectionPrecision = connectionPrecision;
    this.connectionGeolocationDate = connectionGeolocationDate;
    this.connectionGeometricZone = connectionGeometricZone;
    this.propertyCadastralKey = propertyCadastralKey;
    this.zoneId = zoneId;
  }
}