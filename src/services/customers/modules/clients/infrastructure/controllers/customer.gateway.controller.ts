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
import { ClientKafka } from '@nestjs/microservices/client/client-kafka';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { CreateCustomerRequest } from '../../domain/schemas/dto/request/create.customer.request';
import { RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateCustomerRequest } from '../../domain/schemas/dto/request/update.customer.request';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { environments } from '../../../../../../settings/environments/environments';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

@Controller('Customers')
@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class CustomerGatewayController {
  private readonly logger: Logger = new Logger(CustomerGatewayController.name);
  constructor(
    // Inject any required services here
    @Inject(environments.CLIENTS_KAFKA_CLIENT)
    private readonly customerClient: ClientKafka,
  ) {}

  @Post('create-customer')
  @ApiOperation({
    summary: 'Method POST - Create a new customer',
    description:
      'The endpoint allows you to create a new customer in the system',
  })
  async createCustomer(
    @Req() request: Request,
    @Body() customer: CreateCustomerRequest,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.customerClient.send('customers.create-customer', customer),
      );
      return new ApiResponse(
        `Customer created successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('update-customer/:customerId')
  @ApiOperation({
    summary: 'Method PUT - Update an existing customer',
    description:
      'The endpoint allows you to update an existing customer in the system',
  })
  async updateCustomer(
    @Req() request: Request,
    @Param('customerId') customerId: string,
    @Body() customer: UpdateCustomerRequest,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.customerClient.send('customers.update-customer', {
          customerId,
          customer,
        }),
      );
      return new ApiResponse(
        `Customer updated successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete('delete-customer/:customerId')
  @ApiOperation({
    summary: 'Method DELETE - Delete a customer by ID',
    description:
      'The endpoint allows you to delete a customer from the system by their ID',
  })
  async deleteCustomer(
    @Req() request: Request,
    @Param('customerId') customerId: string,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.customerClient.send('customers.delete-customer', customerId),
      );
      return new ApiResponse(
        `Customer with ID ${customerId} deleted successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-customer-by-id/:customerId')
  @ApiOperation({
    summary: 'Method GET - Get a customer by ID',
    description:
      'The endpoint allows you to retrieve a customer from the system by their ID',
  })
  async getCustomerById(
    @Req() request: Request,
    @Param('customerId') customerId: string,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.customerClient.send('customers.get-customer-by-id', customerId),
      );
      return new ApiResponse(
        `Customer with ID ${customerId} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-all-customers')
  @ApiOperation({
    summary: 'Method GET - Get all customers',
    description:
      'The endpoint allows you to retrieve all customers from the system with pagination',
  })
  async getAllCustomers(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.customerClient.send('customers.get-all-customers', {
          limit: Number(limit),
          offset: Number(offset),
        }),
      );

      return new ApiResponse(
        `Customers retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('verify-customer-exists/:customerId')
  @ApiOperation({
    summary: 'Method GET - Verify if a customer exists by ID',
    description:
      'The endpoint allows you to verify if a customer exists in the system by their ID',
  })
  async verifyCustomerExists(
    @Req() request: Request,
    @Param('customerId') customerId: string,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.customerClient.send(
          'customers.verify-customer-exists',
          customerId,
        ),
      );
      return new ApiResponse(
        `Customer existence verification for ID ${customerId} completed successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-general-customers')
  @ApiOperation({
    summary: 'Method GET - Get general customers',
    description:
      'The endpoint allows you to retrieve general customer information from the system with pagination',
  })
  async getGeneralCustomers(
    @Req() request: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.customerClient.send('customers.get-general-customers', {
          limit: Number(limit),
          offset: Number(offset),
        }),
      );

      return new ApiResponse(
        `General customers retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
