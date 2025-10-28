import { ApiProperty } from "@nestjs/swagger"

export class CreateCustomerRequest {
  @ApiProperty({
    description: 'Unique identifier for the customer',
    example: 12345,
  })
  customerId: number

  @ApiProperty({
    description: 'First name of the customer',
    example: 'John',
  })
  firstName: string

  @ApiProperty({
    description: 'Last name of the customer',
    example: 'Doe',
  })
  lastName: string

  @ApiProperty({
    description: 'Email addresses of the customer',
    example: ['john.doe@example.com'],
  })
  emails: string[]

  @ApiProperty({
    description: 'Phone numbers of the customer',
    example: ['+1234567890'],
  })
  phoneNumbers: string[]

  @ApiProperty({
    description: 'Date of birth of the customer',
    example: '1990-01-01',
  })
  dateOfBirth: Date

  @ApiProperty({
    description: 'Sex ID of the customer',
    example: 1,
  })
  sexId: number

  @ApiProperty({
    description: 'Civil status of the customer',
    example: 1,
  })
  civilStatus: number

  @ApiProperty({
    description: 'Address of the customer',
    example: '123 Main St, Anytown, USA',
  })
  address: string

  @ApiProperty({
    description: 'Profession ID of the customer',
    example: 1,
  })
  professionId: number

  @ApiProperty({
    description: 'Origin country of the customer',
    example: 'USA',
  })
  originCountry: string

  @ApiProperty({
    description: 'Identification type of the customer',
    example: 'CED',
  })
  identificationType: string

  @ApiProperty({
    description: 'Parish ID of the customer',
    example: '100150',
  })
  parishId: string

  @ApiProperty({
    description: 'Indicates if the customer is deceased',
    example: false,
  })
  deceased?: boolean

  constructor(
    customerId: number,
    firstName: string,
    lastName: string,
    emails: string[],
    phoneNumbers: string[],
    dateOfBirth: Date,
    sexId: number,
    civilStatus: number,
    address: string,
    professionId: number,
    originCountry: string,
    identificationType: string,
    parishId: string,
    deceased?: boolean
  ) {
    this.customerId = customerId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.emails = emails;
    this.phoneNumbers = phoneNumbers;
    this.dateOfBirth = dateOfBirth;
    this.sexId = sexId;
    this.civilStatus = civilStatus;
    this.address = address;
    this.professionId = professionId;
    this.originCountry = originCountry;
    this.identificationType = identificationType;
    this.parishId = parishId;
    this.deceased = deceased;
  }
}