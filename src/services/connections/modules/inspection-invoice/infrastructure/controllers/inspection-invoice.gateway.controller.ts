import {
  Body,
  Controller,
  Param,
  Get,
  Inject,
  Logger,
  Post,
  Put,
  Query,
  Req,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateInspectionInvoiceRequest } from '../../domain/schemas/dto/request/create-inspection-invoice.request';
import { UpdateInspectionInvoiceRequest } from '../../domain/schemas/dto/request/update-inspection-invoice.request';
@Controller('inspection-invoice')
export class InspectionInvoiceGatewayController {
  // Implement your controller methods here
  private readonly logger: Logger = new Logger(
    InspectionInvoiceGatewayController.name,
  );

  constructor(
    @Inject(environments.CONNECTION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {
    this.logger.log('InspectionInvoiceController initialized');
  }

  @Post('create_inspection_invoice')
  @ApiOperation({
    summary: 'Create a new inspection invoice',
    description: 'Creates a new inspection invoice based on the provided data.',
  })
  async createInspectionInvoice(
    @Body() data: CreateInspectionInvoiceRequest, // Replace 'any' with your actual DTO type
    @Req() request: Request, // You can replace 'any' with the actual type of your request if needed
  ): Promise<ApiResponse> {
    // Replace 'any' with your actual response type
    try {
      this.logger.log(
        'Received request to create inspection invoice: ' +
          JSON.stringify(data),
      );
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'inspection-invoice.create',
          data,
        ),
      );
      this.logger.log(
        'Successfully created inspection invoice: ' + JSON.stringify(result),
      );
      return new ApiResponse(
        'Inspection invoice created successfully',
        result,
        request.url,
        201,
      );
    } catch (error) {
      this.logger.error('Error updating connection document', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('get_by_id/:invoiceId')
  @ApiOperation({
    summary: 'Get an inspection invoice by ID',
    description: 'Retrieves an inspection invoice based on the provided ID.',
  })
  async getInspectionInvoiceById(
    @Param('invoiceId') invoiceId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        'Received request to get inspection invoice by ID: ' + invoiceId,
      );
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'inspection-invoice.getById',
          invoiceId,
        ),
      );
      this.logger.log(
        'Successfully retrieved inspection invoice: ' + JSON.stringify(result),
      );
      return new ApiResponse(
        'Inspection invoice retrieved successfully',
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error('Error retrieving inspection invoice', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('find_all')
  @ApiOperation({
    summary: 'Get all inspection invoices',
    description: 'Retrieves a list of all inspection invoices with pagination.',
  })
  async findAllInspectionInvoices(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to get all inspection invoices with limit=${limit} and offset=${offset}`,
      );
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'inspection-invoice.findAll', {
          limit,
          offset,
        }),
      );
      this.logger.log(
        'Successfully retrieved inspection invoices: ' + JSON.stringify(result),
      );
      return new ApiResponse(
        'Inspection invoices retrieved successfully',
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error('Error retrieving inspection invoices', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Get('by-request/:requestId')
  @ApiOperation({
    summary: 'Get all inspection invoices by request ID',
    description:
      'Retrieves a list of all inspection invoices associated with a specific request ID, with pagination.',
  })
  async findAllInspectionInvoicesByRequestId(
    @Param('requestId') requestId: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Received request to get all inspection invoices for requestId=${requestId} with limit=${limit} and offset=${offset}`,
      );
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'inspection-invoice.findAllByRequestId',
          { requestId, limit, offset },
        ),
      );
      this.logger.log(
        'Successfully retrieved inspection invoices by request ID: ' +
          JSON.stringify(result),
      );
      return new ApiResponse(
        'Inspection invoices retrieved successfully',
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error(
        'Error retrieving inspection invoices by request ID',
        error,
      );
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Delete('delete/:invoiceId')
  @ApiOperation({
    summary: 'Delete an inspection invoice by ID',
    description: 'Deletes an inspection invoice based on the provided ID.',
  })
  async deleteInspectionInvoice(
    @Param('invoiceId') invoiceId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        'Received request to delete inspection invoice by ID: ' + invoiceId,
      );
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'inspection-invoice.delete',
          invoiceId,
        ),
      );
      this.logger.log(
        'Successfully deleted inspection invoice: ' + JSON.stringify(result),
      );
      return new ApiResponse(
        'Inspection invoice deleted successfully',
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error('Error deleting inspection invoice', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }

  @Put('update/:invoiceId')
  @ApiOperation({
    summary: 'Update an inspection invoice by ID',
    description:
      'Updates an inspection invoice based on the provided ID and data.',
  })
  async updateInspectionInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() updateData: UpdateInspectionInvoiceRequest, // Replace with your actual DTO for updates
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        'Received request to update inspection invoice by ID: ' +
          invoiceId +
          ' with data: ' +
          JSON.stringify(updateData),
      );
      const result = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'inspection-invoice.update', {
          invoiceId,
          updateData,
        }),
      );
      this.logger.log(
        'Successfully updated inspection invoice: ' + JSON.stringify(result),
      );
      return new ApiResponse(
        'Inspection invoice updated successfully',
        result,
        request.url,
        200,
      );
    } catch (error) {
      this.logger.error('Error updating inspection invoice', error);
      const err = error instanceof RpcException ? error.getError() : error;
      throw new RpcException(err as string | object);
    }
  }
}
