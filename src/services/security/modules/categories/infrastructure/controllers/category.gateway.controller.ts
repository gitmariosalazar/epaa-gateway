import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ClientKafka } from '@nestjs/microservices/client/client-kafka';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { CreateCategoryRequest } from '../../domain/schemas/dto/request/create.category.request';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { RpcException } from '@nestjs/microservices';
import { UpdateCategoryRequest } from '../../domain/schemas/dto/request/update.category.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { CategoryResponse } from '../../domain/schemas/dto/response/category.response';

@Controller('categories-gateway')
@ApiTags('categories-gateway')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class CategoryGatewayController implements OnModuleInit {
  constructor(
    @Inject(environments.GATEWAY_CATEGORIES_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  onModuleInit() {
    const requestPatterns = [
      'authentication.categories.get_category_by_id',
      'authentication.categories.get_all_categories',
      'authentication.categories.create_category',
      'authentication.categories.update_category',
      'authentication.categories.delete_category',
      'authentication.categories.verify_category_existence',
    ];

    requestPatterns.forEach((pattern) => {
      this.kafkaClient.subscribeToResponseOf(pattern);
    });
  }

  @Post('create-category')
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Endpoint to create a new category in the system',
  })
  async createCategory(
    @Req() request: Request,
    @Body() category: CreateCategoryRequest,
  ): Promise<ApiResponse> {
    try {
      const pattern = 'authentication.categories.create_category';
      const response: CategoryResponse = await sendKafkaRequest(
        this.kafkaClient.send(pattern, category),
      );
      return new ApiResponse('Create Category success', response, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('update-category/:categoryId')
  @ApiOperation({
    summary: 'Update an existing category',
    description: 'Endpoint to update an existing category in the system',
  })
  async updateCategory(
    @Req() request: Request,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() category: UpdateCategoryRequest,
  ): Promise<ApiResponse> {
    try {
      const pattern = 'authentication.categories.update_category';
      const response: CategoryResponse = await sendKafkaRequest(
        this.kafkaClient.send(pattern, {
          categoryId,
          categoryDetails: category,
        }),
      );
      return new ApiResponse('Update Category success', response, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete('delete-category/:categoryId')
  @ApiOperation({
    summary: 'Delete an existing category',
    description: 'Endpoint to delete an existing category in the system',
  })
  async deleteCategory(
    @Req() request: Request,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<ApiResponse> {
    try {
      const pattern = 'authentication.categories.delete_category';
      const response: boolean = await sendKafkaRequest(
        this.kafkaClient.send(pattern, categoryId),
      );
      return new ApiResponse('Delete Category success', response, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-category-by-id/:categoryId')
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Endpoint to get a category by its ID',
  })
  async getCategoryById(
    @Req() request: Request,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<ApiResponse> {
    try {
      const pattern = 'authentication.categories.get_category_by_id';
      const response: CategoryResponse = await sendKafkaRequest(
        this.kafkaClient.send(pattern, categoryId),
      );
      return new ApiResponse(
        'Get Category by ID success',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-all-categories')
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Endpoint to get all categories in the system',
  })
  async getAllCategories(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const pattern = 'authentication.categories.get_all_categories';
      const response: CategoryResponse[] = await sendKafkaRequest(
        this.kafkaClient.send(pattern, { limit, offset }),
      );
      return new ApiResponse(
        'Get All Categories success',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('verify-category-existence/:categoryName')
  @ApiOperation({
    summary: 'Verify category existence by name',
    description: 'Endpoint to verify if a category exists by its name',
  })
  async verifyCategoryExistence(
    @Req() request: Request,
    @Param('categoryName') categoryName: string,
  ): Promise<ApiResponse> {
    try {
      const pattern = 'authentication.categories.verify_category_existence';
      const response: boolean = await sendKafkaRequest(
        this.kafkaClient.send(pattern, categoryName),
      );
      return new ApiResponse(
        'Verify Category Existence success',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
