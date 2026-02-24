import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { CreateWorkOrderAttachmentsRequest } from '../../domain/schemas/dto/request/create.work-order-attachments.request';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { extname } from 'path/win32';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

@Controller('work-order-attachments')
@ApiTags('Work Order Attachments')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class WorkOrderAttachmentsGatewayController implements OnModuleInit {
  constructor(
    @Inject(environments.GATEWAY_WORK_ORDER_ATTACHMENTS_KAFKA_CLIENT)
    private readonly workOrderAttachmentsKafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const requestPatterns = [
      'work-order-attachments.add_work_order_attachment',
      'work-order-attachments.find_all_attachments',
      'work-order-attachments.get_work_order_attachment_by_id',
      'work-order-attachments.delete_work_order_attachment',
      'work-order-attachments.update_work_order_attachment',
      'work-order-attachments.find_attachments_by_work_order_id',
    ];

    requestPatterns.forEach((pattern) => {
      this.workOrderAttachmentsKafkaClient.subscribeToResponseOf(pattern);
    });

    await this.workOrderAttachmentsKafkaClient.connect();
  }

  @Post('add-work-order-attachment')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      // Puedes mantener 'Pictures' o cambiar a 'files' si prefieres
      storage: diskStorage({
        destination: environments.FILE_STORAGE_PATH,
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`); // Nombre único y limpio
        },
      }),
      fileFilter: (req, file, cb) => {
        // Permitir imágenes y PDFs
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/bmp',
          'application/pdf',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Solo se permiten imágenes (JPEG, PNG, GIF, WebP, BMP) y documentos PDF',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB recomendado (PDFs pueden ser más pesados que imágenes)
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Agregar uno o más adjuntos a una orden de trabajo',
    description: 'Permite subir imágenes y documentos PDF como adjuntos.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Archivos adjuntos: imágenes o PDFs (máx 10)',
        },
        workOrderId: { type: 'string', example: '1' },
        descripcion: {
          type: 'string',
          example: 'Foto del daño o informe en PDF',
        },
      },
      required: ['workOrderId', 'images'],
    },
  })
  async addWorkOrderAttachment(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: { workOrderId: string; descripcion?: string },
    @Req() request: Request,
  ): Promise<ApiResponse> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Debe subir al menos un archivo');
    }

    try {
      const results: any[] = [];

      // URL base pública (ajusta según tu entorno)
      const baseUrl = 'https://dev.sigepaa-aa.com:8443'; // Recomendado usar variable de entorno

      for (const file of files) {
        const attachmentRequest = new CreateWorkOrderAttachmentsRequest(
          body.workOrderId,
          file.originalname, // Nombre original (visible para el usuario)
          file.mimetype, // image/jpeg o application/pdf
          `${baseUrl}/${file.filename}`, // URL accesible públicamente
        );

        const result = await sendKafkaRequest(
          this.workOrderAttachmentsKafkaClient.send(
            'work-order-attachments.add_work_order_attachment',
            attachmentRequest,
          ),
        );

        results.push(result);
      }

      return new ApiResponse(
        `Se agregaron ${files.length} adjunto(s) exitosamente`,
        results,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-all-attachments')
  @ApiOperation({
    summary: 'Get all work order attachments',
    description: 'Retrieve a list of all work order attachments.',
  })
  async findAllAttachments(@Req() request: Request): Promise<ApiResponse> {
    try {
      const result = await sendKafkaRequest(
        this.workOrderAttachmentsKafkaClient.send(
          'work-order-attachments.find_all_attachments',
          {},
        ),
      );

      return new ApiResponse(
        'Work order attachments retrieved successfully',
        result,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-work-order-attachment-by-id/:attachmentId')
  @ApiOperation({
    summary: 'Get a work order attachment by its ID',
    description: 'Retrieve a specific work order attachment using its ID.',
  })
  async getWorkOrderAttachmentById(
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const result = await sendKafkaRequest(
        this.workOrderAttachmentsKafkaClient.send(
          'work-order-attachments.get_work_order_attachment_by_id',
          attachmentId,
        ),
      );

      return new ApiResponse(
        'Work order attachment retrieved successfully',
        result,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete('delete-work-order-attachment/:attachmentId')
  @ApiOperation({
    summary: 'Delete a work order attachment by its ID',
    description: 'Delete a specific work order attachment using its ID.',
  })
  async deleteWorkOrderAttachment(
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const result = await sendKafkaRequest(
        this.workOrderAttachmentsKafkaClient.send(
          'work-order-attachments.delete_work_order_attachment',
          attachmentId,
        ),
      );

      return new ApiResponse(
        'Work order attachment deleted successfully',
        result,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('update-work-order-attachment/:attachmentId')
  @ApiOperation({
    summary: 'Update a work order attachment by its ID',
    description: 'Update a specific work order attachment using its ID.',
  })
  async updateWorkOrderAttachment(
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @Body() attachment: CreateWorkOrderAttachmentsRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const payload = { attachmentId, ...attachment };
      const result = await sendKafkaRequest(
        this.workOrderAttachmentsKafkaClient.send(
          'work-order-attachments.update_work_order_attachment',
          payload,
        ),
      );

      return new ApiResponse(
        'Work order attachment updated successfully',
        result,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-attachments-by-work-order-id/:workOrderId')
  @ApiOperation({
    summary: 'Get attachments by work order ID',
    description:
      'Retrieve a list of attachments associated with a specific work order ID.',
  })
  async findAttachmentsByWorkOrderId(
    @Param('workOrderId') workOrderId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const result = await sendKafkaRequest(
        this.workOrderAttachmentsKafkaClient.send(
          'work-order-attachments.find_attachments_by_work_order_id',
          workOrderId,
        ),
      );

      return new ApiResponse(
        'Work order attachments retrieved successfully',
        result,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
