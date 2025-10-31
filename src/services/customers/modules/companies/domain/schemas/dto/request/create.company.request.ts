import { ApiProperty } from "@nestjs/swagger";

export class CreateCompanyRequest {
  @ApiProperty(
    { example: 'Tech Solutions LLC', description: 'Name of the company', type: String }
  )
  companyName: string;
  @ApiProperty(
    { example: 'Tech Solutions for Modern Problems', description: 'Social reason of the company', type: String }
  )
  socialReason: string;
  @ApiProperty(
    { example: '1234567890', description: 'RUC of the company', type: String }
  )
  companyRuc: string;
  @ApiProperty(
    { example: '123 Main St', description: 'Address of the company', type: String }
  )
  companyAddress: string;
  @ApiProperty(
    { example: '1', description: 'Parish ID of the company', type: String }
  )
  companyParishId: string;
  @ApiProperty(
    { example: 'USA', description: 'Country of the company', type: String }
  )
  companyCountry: string;
  @ApiProperty(
    { example: ['info@techsolutions.com'], description: 'Emails of the company', type: String, isArray: true }
  )
  companyEmails: string[];
  @ApiProperty(
    { example: ['+1-234-567-8901'], description: 'Phones of the company', type: String, isArray: true }
  )
  companyPhones: string[];
  @ApiProperty(
    { example: 'RUC', description: 'Identification type of the company', type: String }
  )
  identificationType: string;

  constructor(
    companyName: string,
    socialReason: string,
    companyRuc: string,
    companyAddress: string,
    companyParishId: string,
    companyCountry: string,
    companyEmails: string[],
    companyPhones: string[],
    identificationType: string
  ) {
    this.companyName = companyName;
    this.socialReason = socialReason;
    this.companyRuc = companyRuc;
    this.companyAddress = companyAddress;
    this.companyParishId = companyParishId;
    this.companyCountry = companyCountry;
    this.companyEmails = companyEmails;
    this.companyPhones = companyPhones;
    this.identificationType = identificationType;
  }
}