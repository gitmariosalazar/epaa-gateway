import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { CreateCompanyRequest } from '../../domain/schemas/dto/request/create.company.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { UpdateCompanyRequest } from '../../domain/schemas/dto/request/update.company.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

@Controller('Customers')
@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class CompanyGatewayController {
  private readonly logger = new Logger(CompanyGatewayController.name);
  constructor(
    @Inject(environments.CLIENTS_KAFKA_CLIENT)
    private readonly companyKafkaClient: ClientKafka,
  ) {}

  @Post('create-company')
  @ApiOperation({
    summary: 'Method POST - Create a new company',
    description:
      'The endpoint allows you to create a new company in the system',
  })
  async createCompany(
    @Req() request: Request,
    @Body() company: CreateCompanyRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to create company: ${JSON.stringify(company)}`,
      );
      const response = await sendKafkaRequest(
        this.companyKafkaClient.send('companies.create-company', company),
      );
      this.logger.log(
        `Company created successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Company created successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Put('update-company/:companyRuc')
  @ApiOperation({
    summary: 'Method PUT - Update an existing company',
    description:
      'The endpoint allows you to update an existing company in the system',
  })
  async updateCompany(
    @Req() request: Request,
    @Param('companyRuc') companyRuc: string,
    @Body() company: UpdateCompanyRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to update company: ${JSON.stringify(company)}`,
      );
      const response = await sendKafkaRequest(
        this.companyKafkaClient.send('companies.update-company', {
          companyRuc,
          company,
        }),
      );
      this.logger.log(
        `Company updated successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Company updated successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('get-company/:companyRuc')
  @ApiOperation({
    summary: 'Method GET - Get a company by RUC',
    description:
      'The endpoint allows you to get a company from the system by its RUC',
  })
  async getCompanyByRuc(
    @Req() request: Request,
    @Param('companyRuc') companyRuc: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Received request to get company by RUC: ${companyRuc}`);
      const response = await sendKafkaRequest(
        this.companyKafkaClient.send(
          'companies.get-company-by-ruc',
          companyRuc,
        ),
      );
      this.logger.log(
        `Company retrieved successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Company retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('get-all-companies')
  @ApiOperation({
    summary: 'Method GET - Get all companies',
    description:
      'The endpoint allows you to get all companies from the system with pagination',
  })
  async getAllCompanies(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to get all companies with limit: ${limit}, offset: ${offset}`,
      );
      const response = await sendKafkaRequest(
        this.companyKafkaClient.send('companies.get-all-companies', {
          limit,
          offset,
        }),
      );
      return new ApiResponse(
        `Companies retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Delete('delete-company/:companyRuc')
  @ApiOperation({
    summary: 'Method DELETE - Delete a company by RUC',
    description:
      'The endpoint allows you to delete a company from the system by its RUC',
  })
  async deleteCompany(
    @Req() request: Request,
    @Param('companyRuc') companyRuc: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to delete company with RUC: ${companyRuc}`,
      );
      const response = await sendKafkaRequest(
        this.companyKafkaClient.send('companies.delete-company', companyRuc),
      );
      this.logger.log(
        `Company deleted successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Company deleted successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('verify-company-exists/:companyRuc')
  @ApiOperation({
    summary: 'Method GET - Verify if a company exists by RUC',
    description:
      'The endpoint allows you to verify if a company exists in the system by its RUC',
  })
  async verifyCompanyExists(
    @Req() request: Request,
    @Param('companyRuc') companyRuc: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to verify if company exists with RUC: ${companyRuc}`,
      );
      const response = await sendKafkaRequest(
        this.companyKafkaClient.send(
          'companies.verify-company-exists',
          companyRuc,
        ),
      );
      this.logger.log(
        `Company existence verified successfully: ${JSON.stringify(response)}`,
      );
      return new ApiResponse(
        `Company existence verified successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }
}
