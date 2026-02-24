import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { CreateDetailWorkOrderMaterialRequest } from '../../domain/schemas/dto/request/create-detail-work-order-material.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

@Controller('detail-work-order-materials')
@ApiTags('Detail Work Order Material Gateway')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class DetailWorkOrderMaterialGatewayController implements OnModuleInit {
  constructor(
    @Inject(environments.GATEWAY_DETAIL_WORK_ORDER_MATERIAL_KAFKA_CLIENT)
    private readonly detailWorkOrderMaterialKafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const requestPatterns = [
      'detail_work_order_material.add_detail_work_order_materials',
      'detail_work_order_material.get_detail_work_order_materials_by_work_order_id',
      'detail_work_order_material.delete_detail_work_order_materials_by_work_order_id',
    ];

    requestPatterns.forEach((pattern) => {
      this.detailWorkOrderMaterialKafkaClient.subscribeToResponseOf(pattern);
    });

    await this.detailWorkOrderMaterialKafkaClient.connect();
  }
  @Post('create-detail-work-order-materials')
  @ApiOperation({
    summary: 'Create detail work order materials',
    description:
      'Creates detail work order materials associated with a work order.',
  })
  @ApiBody({
    type: [CreateDetailWorkOrderMaterialRequest],
    examples: {
      example1: {
        summary: 'Two materials example',
        value: [
          {
            workOrderId: 'WO-12345',
            materialId: 1,
            quantity: 10,
            unitCost: 15.5,
          },
          {
            workOrderId: 'WO-12345',
            materialId: 2,
            quantity: 5,
            unitCost: 8.75,
          },
        ],
      },
    },
  })
  async createDetailWorkOrderMaterials(
    @Body() detailWorkOrderMaterials: CreateDetailWorkOrderMaterialRequest[],
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.detailWorkOrderMaterialKafkaClient.send(
          'detail_work_order_material.add_detail_work_order_materials',
          detailWorkOrderMaterials,
        ),
      );

      return new ApiResponse(
        'Detail Work Order Materials Created',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-detail-work-order-materials/:workOrderId')
  @ApiOperation({
    summary: 'Get detail work order materials by work order ID',
    description:
      'Retrieves all detail work order materials associated with the specified work order ID.',
  })
  async getDetailWorkOrderMaterialsByWorkOrderId(
    @Param('workOrderId') workOrderId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.detailWorkOrderMaterialKafkaClient.send(
          'detail_work_order_material.get_detail_work_order_materials_by_work_order_id',
          workOrderId,
        ),
      );
      return new ApiResponse(
        `Detail Work Order Materials for Work Order ID: ${workOrderId}`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete('delete-detail-work-order-materials/:workOrderId')
  @ApiOperation({
    summary: 'Delete detail work order materials by work order ID',
    description:
      'Deletes all detail work order materials associated with the specified work order ID.',
  })
  async deleteDetailWorkOrderMaterialsByWorkOrderId(
    @Param('workOrderId') workOrderId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.detailWorkOrderMaterialKafkaClient.send(
          'detail_work_order_material.delete_detail_work_order_materials_by_work_order_id',
          workOrderId,
        ),
      );
      return new ApiResponse(
        `Detail Work Order Materials Deleted for Work Order ID: ${workOrderId}`,
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
