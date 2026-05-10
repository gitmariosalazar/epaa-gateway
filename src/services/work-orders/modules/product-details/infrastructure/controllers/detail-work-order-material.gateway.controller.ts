import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
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
export class DetailWorkOrderMaterialGatewayController {
  private readonly logger = new Logger(
    DetailWorkOrderMaterialGatewayController.name,
  );
  constructor(
    @Inject(environments.GATEWAY_DETAIL_WORK_ORDER_MATERIAL_KAFKA_CLIENT)
    private readonly detailWorkOrderMaterialKafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

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
        this.kafkaProxy.send(this.detailWorkOrderMaterialKafkaClient, 
          'detail_work_order_material.get_detail_work_order_materials_by_work_order_id', workOrderId,
        ),
      );
      return new ApiResponse(
        `Detail Work Order Materials for Work Order ID: ${workOrderId}`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getDetailWorkOrderMaterialsByWorkOrderId: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.detailWorkOrderMaterialKafkaClient, 
          'detail_work_order_material.delete_detail_work_order_materials_by_work_order_id', workOrderId,
        ),
      );
      return new ApiResponse(
        `Detail Work Order Materials Deleted for Work Order ID: ${workOrderId}`,
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in deleteDetailWorkOrderMaterialsByWorkOrderId: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
