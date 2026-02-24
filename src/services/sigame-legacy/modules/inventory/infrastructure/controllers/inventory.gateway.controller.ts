import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

@Controller('inventory')
@ApiTags('Inventory - Legacy')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class InventoryGatewayController implements OnModuleInit {
  private readonly logger = new Logger(InventoryGatewayController.name);
  constructor(
    @Inject(environments.INVENTORY_KAFKA_CLIENT)
    private readonly inventoryClient: ClientKafka,
  ) {}
  async onModuleInit() {
    this.inventoryClient.subscribeToResponseOf('inventory.get-inventory-by-id');
    this.inventoryClient.subscribeToResponseOf('inventory.get-all-inventories');
    this.inventoryClient.subscribeToResponseOf(
      'inventory.get-inventories-below-min-stock',
    );
    this.inventoryClient.subscribeToResponseOf(
      'inventory.get-inventories-by-account-code',
    );
    this.inventoryClient.subscribeToResponseOf(
      'inventory.get-inventories-by-company-code',
    );
    this.inventoryClient.subscribeToResponseOf(
      'inventory.get-inventories-by-status',
    );
    this.inventoryClient.subscribeToResponseOf(
      'inventory.get-inventories-by-item-type',
    );
    this.inventoryClient.subscribeToResponseOf(
      'inventory.get-inventories-by-unit-of-measure',
    );
    this.inventoryClient.subscribeToResponseOf(
      'inventory.get-inventories-like-item-name',
    );
    this.inventoryClient.subscribeToResponseOf(
      'inventory.get-inventories-like-item-code',
    );
    this.inventoryClient.subscribeToResponseOf(
      'inventory.find-all-inventories-paginated',
    );
    this.logger.log(
      'InventoryGatewayController initialized and connected to Kafka',
    );
    await this.inventoryClient.connect();
  }

  @Get('get-inventory/:inventoryId')
  @ApiOperation({
    summary: 'Method GET - Get Inventory by ID (Legacy)',
    description: 'The endpoint allows you to get an Inventory by ID (Legacy)',
  })
  async getInventoryById(
    @Req() request: Request,
    @Param('inventoryId') inventoryId: number,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getInventoryById request: ${JSON.stringify(inventoryId)}`,
      );
      const response = await sendKafkaRequest(
        this.inventoryClient.send('inventory.get-inventory-by-id', inventoryId),
      );
      return new ApiResponse(
        `Inventory with ID ${inventoryId} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getInventoryById: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-all-inventories')
  @ApiOperation({
    summary: 'Method GET - Get All Inventories (Legacy)',
    description: 'The endpoint allows you to get all Inventories (Legacy)',
  })
  async getAllInventories(
    @Req() request: Request,
    @Param() data: { limit?: number; offset?: number },
  ): Promise<ApiResponse> {
    const limit = data?.limit ?? 100;
    const offset = data?.offset ?? 0;
    try {
      this.logger.log(
        `Sending getAllInventories request: limit=${limit}, offset=${offset}`,
      );
      const response = await sendKafkaRequest(
        this.inventoryClient.send('inventory.get-all-inventories', {
          limit,
          offset,
        }),
      );
      return new ApiResponse(
        `All inventories retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getAllInventories: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-inventories-below-min-stock')
  @ApiOperation({
    summary: 'Method GET - Get Inventories Below Minimum Stock (Legacy)',
    description:
      'The endpoint allows you to get Inventories Below Minimum Stock (Legacy)',
  })
  async getInventoriesBelowMinStock(
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getInventoriesBelowMinStock request`);
      const response = await sendKafkaRequest(
        this.inventoryClient.send(
          'inventory.get-inventories-below-min-stock',
          {},
        ),
      );
      return new ApiResponse(
        `Inventories below minimum stock retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getInventoriesBelowMinStock: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-inventories-by-account-code/:accountCode')
  @ApiOperation({
    summary: 'Method GET - Get Inventories by Account Code (Legacy)',
    description:
      'The endpoint allows you to get Inventories by Account Code (Legacy)',
  })
  async getInventoriesByAccountCode(
    @Req() request: Request,
    @Param('accountCode') accountCode: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getInventoriesByAccountCode request: ${accountCode}`,
      );
      const response = await sendKafkaRequest(
        this.inventoryClient.send(
          'inventory.get-inventories-by-account-code',
          accountCode,
        ),
      );
      return new ApiResponse(
        `Inventories for account code ${accountCode} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getInventoriesByAccountCode: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-inventories-by-company-code/:companyCode')
  @ApiOperation({
    summary: 'Method GET - Get Inventories by Company Code (Legacy)',
    description:
      'The endpoint allows you to get Inventories by Company Code (Legacy)',
  })
  async getInventoriesByCompanyCode(
    @Req() request: Request,
    @Param('companyCode') companyCode: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getInventoriesByCompanyCode request: ${companyCode}`,
      );
      const response = await sendKafkaRequest(
        this.inventoryClient.send(
          'inventory.get-inventories-by-company-code',
          companyCode,
        ),
      );
      return new ApiResponse(
        `Inventories for company code ${companyCode} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getInventoriesByCompanyCode: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-inventories-by-status/:status')
  @ApiOperation({
    summary: 'Method GET - Get Inventories by Status (Legacy)',
    description:
      'The endpoint allows you to get Inventories by Status (Legacy)',
  })
  async getInventoriesByStatus(
    @Req() request: Request,
    @Param('status') status: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getInventoriesByStatus request: ${status}`);
      const response = await sendKafkaRequest(
        this.inventoryClient.send(
          'inventory.get-inventories-by-status',
          status,
        ),
      );
      return new ApiResponse(
        `Inventories with status ${status} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getInventoriesByStatus: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-inventories-by-item-type/:itemType')
  @ApiOperation({
    summary: 'Method GET - Get Inventories by Item Type (Legacy)',
    description:
      'The endpoint allows you to get Inventories by Item Type (Legacy)',
  })
  async getInventoriesByItemType(
    @Req() request: Request,
    @Param('itemType') itemType: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending getInventoriesByItemType request: ${itemType}`);
      const response = await sendKafkaRequest(
        this.inventoryClient.send(
          'inventory.get-inventories-by-item-type',
          itemType,
        ),
      );
      return new ApiResponse(
        `Inventories with item type ${itemType} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getInventoriesByItemType: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-inventories-by-unit-of-measure/:unitOfMeasure')
  @ApiOperation({
    summary: 'Method GET - Get Inventories by Unit of Measure (Legacy)',
    description:
      'The endpoint allows you to get Inventories by Unit of Measure (Legacy)',
  })
  async getInventoriesByUnitOfMeasure(
    @Req() request: Request,
    @Param('unitOfMeasure') unitOfMeasure: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getInventoriesByUnitOfMeasure request: ${unitOfMeasure}`,
      );
      const response = await sendKafkaRequest(
        this.inventoryClient.send(
          'inventory.get-inventories-by-unit-of-measure',
          unitOfMeasure,
        ),
      );
      return new ApiResponse(
        `Inventories with unit of measure ${unitOfMeasure} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getInventoriesByUnitOfMeasure: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-inventories-like-item-name/:itemName')
  @ApiOperation({
    summary: 'Method GET - Get Inventories Like Item Name (Legacy)',
    description:
      'The endpoint allows you to get Inventories Like Item Name (Legacy)',
  })
  async getInventoriesLikeItemName(
    @Req() request: Request,
    @Param('itemName') itemName: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getInventoriesLikeItemName request: ${itemName}`,
      );
      const response = await sendKafkaRequest(
        this.inventoryClient.send(
          'inventory.get-inventories-like-item-name',
          itemName,
        ),
      );
      return new ApiResponse(
        `Inventories like item name ${itemName} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getInventoriesLikeItemName: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('get-inventories-like-item-code/:itemCode')
  @ApiOperation({
    summary: 'Method GET - Get Inventories Like Item Code (Legacy)',
    description:
      'The endpoint allows you to get Inventories Like Item Code (Legacy)',
  })
  async getInventoriesLikeItemCode(
    @Req() request: Request,
    @Param('itemCode') itemCode: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending getInventoriesLikeItemCode request: ${itemCode}`,
      );
      const response = await sendKafkaRequest(
        this.inventoryClient.send(
          'inventory.get-inventories-like-item-code',
          itemCode,
        ),
      );
      return new ApiResponse(
        `Inventories like item code ${itemCode} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in getInventoriesLikeItemCode: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }

  @Get('health-check')
  @ApiOperation({
    summary: 'Method GET - Health Check Endpoint',
    description:
      'The endpoint allows you to check the health status of the Inventory Gateway Controller',
  })
  async healthCheck(@Req() request: Request): Promise<ApiResponse> {
    this.logger.log(`Health check requested`);
    return new ApiResponse(
      `Inventory Gateway Controller is healthy!`,
      { status: 'healthy' },
      request.url,
    );
  }

  @Get('find-all-inventories-paginated')
  @ApiOperation({
    summary: 'Method GET - Find All Inventories Paginated (Legacy)',
    description:
      'The endpoint allows you to find all Inventories with pagination (Legacy)',
  })
  async findAllInventoriesPaginated(
    @Req() request: Request,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('query') query?: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending findAllInventoriesPaginated request: limit=${limit}, offset=${offset}, query=${query}`,
      );
      const response = await sendKafkaRequest(
        this.inventoryClient.send('inventory.find-all-inventories-paginated', {
          limit,
          offset,
          query,
        }),
      );
      return new ApiResponse(
        `Paginated inventories retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        `Error in findAllInventoriesPaginated: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error);
    }
  }
}
