import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { renameSync } from 'fs';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { CreateWorkOrderRequest } from '../../domain/dto/request/create-work-order.request';
import { CreateWorkOrderFromIncidentRequest } from '../../domain/dto/request/create-work-order-from-incident.request';
import { ProcessWorkOrderTransitionRequest } from '../../domain/dto/request/process-work-order-transition.request';
import { AssignWorkOrderToCrewRequest } from '../../domain/dto/request/assign-work-order-to-crew.request';
import { AssignWorkOrderToWorkerRequest } from '../../domain/dto/request/assign-work-order-to-worker.request';
import { CreatePreparationInspectionRequest } from '../../domain/dto/request/create-preparation-inspection.request';
import { AddPreparationInspectionDetailRequest } from '../../domain/dto/request/add-preparation-inspection-detail.request';
import { AddWorkOrderMaterialRequest } from '../../domain/dto/request/add-work-order-material.request';
import { AddAdditionalCostRequest } from '../../domain/dto/request/add-additional-cost.request';
import { AddAdditionalCostsBatchRequest } from '../../domain/dto/request/add-additional-costs-batch.request';
import { AddWorkOrderAttachmentRequest } from '../../domain/dto/request/add-work-order-attachment.request';
import { CreateQualityControlRequest } from '../../domain/dto/request/create-quality-control.request';
import { AddQualityControlDetailRequest } from '../../domain/dto/request/add-quality-control-detail.request';
import { RegisterSatisfactionSurveyRequest } from '../../domain/dto/request/register-satisfaction-survey.request';
import { ResolvePreparationInspectionRequest } from '../../domain/dto/request/resolve-preparation-inspection.request';
import { ResolveQualityControlRequest } from '../../domain/dto/request/resolve-quality-control.request';
import { AddWorkerToWorkOrderRequest } from '../../domain/dto/request/add-worker-to-work-order.request';
import { RemoveWorkerFromWorkOrderRequest } from '../../domain/dto/request/remove-worker-from-work-order.request';
import { AdvanceWorkOrderStateRequest } from '../../domain/dto/request/advance-work-order-state.request';
import { AddWorkOrderMaterialsBatchRequest } from '../../domain/dto/request/add-work-order-materials-batch.request';
import { AddWorkersBatchToWorkOrderRequest } from '../../domain/dto/request/add-workers-batch-to-work-order.request';

const WORK_ORDERS_UPLOAD_DIR = '/home/sigepaa/sigepaa/images/work_orders';

/** Acepta hasta 10 archivos de cualquier tipo MIME, máx. 50 MB por archivo */
const workOrderAttachmentInterceptor = FilesInterceptor('files', 10, {
  storage: diskStorage({
    destination: WORK_ORDERS_UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `temp-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB por archivo
});

@Controller('process-work-orders')
@ApiTags('Process Work Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ProcessWorkOrderGatewayController {
  private readonly logger = new Logger(ProcessWorkOrderGatewayController.name);

  constructor(
    @Inject(environments.GATEWAY_WORK_ORDER_KAFKA_CLIENT)
    private readonly workOrderKafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  // Ignora cualquier id de usuario que venga en el body: siempre se toma
  // del usuario autenticado inyectado por AuthGuard en request['user'].
  private extractAuthUserId(request: Request): string {
    const authUser = (request as any)['user'] ?? {};
    return authUser?.cliente_id ?? authUser?.sub ?? authUser?.userId;
  }

  @Post('create-work-order')
  @ApiOperation({
    summary: 'Create a work order',
    description:
      'Fase 1 - Paso 1 (Notificacion/Creacion): registra una nueva OT en estado inicial NOTIFICADA e inicia su ciclo de vida.',
  })
  @ApiBody({ type: CreateWorkOrderRequest })
  async createWorkOrder(
    @Body() payload: CreateWorkOrderRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.create',
          { ...payload, createdByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Work order created successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in createWorkOrder: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Post('create-work-order-from-incident')
  @ApiOperation({
    summary: 'Create a work order from an incident',
    description:
      'Fase 1 - Paso 1 (Notificacion/Creacion): registra una nueva OT a partir de un incidente.',
  })
  @ApiBody({ type: CreateWorkOrderFromIncidentRequest })
  async createWorkOrderFromIncident(
    @Body() payload: CreateWorkOrderFromIncidentRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      // 1. Extraemos el usuario en sesión inyectado por el AuthGuard en request['user']
      const authUser = (request as any)['user'] ?? {};
      const userIdCreator =
        authUser?.cliente_id ?? authUser?.sub ?? authUser?.userId;

      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.create-from-incident',
          {
            ...payload,
            userIdCreator, // <- AQUÍ lo inyectamos obligatoriamente desde el token
          },
        ),
      );
      return new ApiResponse(
        'Work order created from incident successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in createWorkOrderFromIncident: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('receive-work-order')
  @ApiOperation({
    summary: 'Receive a work order',
    description:
      'Fase 2 - Paso 1 (Recepcion): recibe la OT y la mueve a estado PENDIENTE para su gestion administrativa.',
  })
  @ApiBody({ type: ProcessWorkOrderTransitionRequest })
  async receiveWorkOrder(
    @Body() payload: ProcessWorkOrderTransitionRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.receive',
          {
            ...payload,
            userId: this.extractAuthUserId(request),
            newStatus: 'PENDIENTE',
          },
        ),
      );
      return new ApiResponse(
        'Work order received successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in receiveWorkOrder: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Post('assign-work-order-to-crew')
  @ApiOperation({
    summary: 'Assign a work order to a crew',
    description:
      'Fase 2 - Paso 2 (Asignacion): asigna la OT a un técnico y la mantiene en flujo ASIGNADA.',
  })
  @ApiBody({ type: AssignWorkOrderToCrewRequest })
  async assignWorkOrderToCrew(
    @Body() payload: AssignWorkOrderToCrewRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.assign-crew',
          { ...payload, assignedByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Work order assigned to crew successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in assignWorkOrderToCrew: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('assign-work-order-to-worker')
  @ApiOperation({
    summary: 'Assign a work order to a worker',
    description:
      'Fase 2 - Paso 2 (Asignacion, opcion B): asigna la OT a un tecnico individual y la mantiene en flujo ASIGNADA.',
  })
  @ApiBody({ type: AssignWorkOrderToWorkerRequest })
  async assignWorkOrderToWorker(
    @Body() payload: AssignWorkOrderToWorkerRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.assign-worker',
          { ...payload, assignedByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Work order assigned to worker successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in assignWorkOrderToWorker: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('start-preparation')
  @ApiOperation({
    summary: 'Start preparation',
    description:
      'Fase 3 - Paso 1 (Preparacion y seguridad): mueve la OT a PREPARACION para checklist y alistamiento.',
  })
  @ApiBody({ type: ProcessWorkOrderTransitionRequest })
  async startPreparation(
    @Body() payload: ProcessWorkOrderTransitionRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.start-preparation',
          {
            ...payload,
            userId: this.extractAuthUserId(request),
            newStatus: 'PREPARACION',
          },
        ),
      );
      return new ApiResponse(
        'Preparation started successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in startPreparation: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Post('create-preparation-inspection')
  @ApiOperation({
    summary: 'Create preparation inspection',
    description:
      'Fase 3 - Paso 2 (Checklist de seguridad): crea la cabecera de inspeccion de preparacion.',
  })
  @ApiBody({ type: CreatePreparationInspectionRequest })
  async createPreparationInspection(
    @Body() payload: CreatePreparationInspectionRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.create-preparation-inspection',
          { ...payload, createdByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Preparation inspection created successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in createPreparationInspection: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('add-preparation-inspection-detail')
  @ApiOperation({
    summary: 'Add preparation inspection detail',
    description:
      'Fase 3 - Paso 2 (Checklist de seguridad): registra el detalle de un item del checklist de preparacion.',
  })
  @ApiBody({ type: AddPreparationInspectionDetailRequest })
  async addPreparationInspectionDetail(
    @Body() payload: AddPreparationInspectionDetailRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.add-preparation-inspection-detail',
          { ...payload, createdByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Preparation inspection detail added successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in addPreparationInspectionDetail: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('resolve-preparation-inspection')
  @ApiOperation({
    summary: 'Resolve preparation inspection',
    description:
      'Fase 3 - Paso 2 (Gateway de decision): si pasa la revision avanza a ejecucion (EN_PROCESO); si no pasa retorna a REVISION_RECHAZADA para correccion.',
  })
  @ApiBody({ type: ResolvePreparationInspectionRequest })
  async resolvePreparationInspection(
    @Body() payload: ResolvePreparationInspectionRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.resolve-preparation-inspection',
          {
            workOrderId: payload.workOrderId,
            userId: this.extractAuthUserId(request),
            comment: payload.comment,
            newStatus: payload.passed ? 'EN_PROCESO' : 'REVISION_RECHAZADA',
          },
        ),
      );
      return new ApiResponse(
        'Preparation inspection resolved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in resolvePreparationInspection: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('start-execution')
  @ApiOperation({
    summary: 'Start field execution',
    description:
      'Fase 4 (Ejecucion en campo): inicia la ejecucion tecnica en EN_PROCESO y registra el inicio operativo.',
  })
  @ApiBody({ type: ProcessWorkOrderTransitionRequest })
  async startExecution(
    @Body() payload: ProcessWorkOrderTransitionRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.start-execution',
          {
            ...payload,
            userId: this.extractAuthUserId(request),
            newStatus: payload.newStatus || 'EN_PROCESO',
          },
        ),
      );
      return new ApiResponse(
        'Execution started successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in startExecution: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Post('add-work-order-material')
  @ApiOperation({
    summary: 'Add work order material',
    description:
      'Fase 4 - Paso 1 (Ejecucion en campo): registra consumo de materiales de bodega asociados a la OT.',
  })
  @ApiBody({ type: AddWorkOrderMaterialRequest })
  async addWorkOrderMaterial(
    @Body() payload: AddWorkOrderMaterialRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.add-work-order-material',
          { ...payload, createdByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Work order material added successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in addWorkOrderMaterial: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('add-work-order-materials-batch')
  @ApiOperation({
    summary: 'Add work order materials in batch',
    description:
      'Fase 4 - Paso 1 (Ejecucion en campo): registra uno o más materiales en una única transacción atómica. Si alguno falla, se revierte el lote completo.',
  })
  @ApiBody({ type: AddWorkOrderMaterialsBatchRequest })
  async addWorkOrderMaterialsBatch(
    @Body() payload: AddWorkOrderMaterialsBatchRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.add-work-order-materials-batch',
          { ...payload, createdByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Work order materials added successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in addWorkOrderMaterialsBatch: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('add-additional-cost')
  @ApiOperation({
    summary: 'Add additional cost',
    description:
      'Fase 4 - Paso 2 (Ejecucion en campo): registra costos adicionales como maquinaria, horas o conceptos extraordinarios.',
  })
  @ApiBody({ type: AddAdditionalCostRequest })
  async addAdditionalCost(
    @Body() payload: AddAdditionalCostRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.add-additional-cost',
          { ...payload, createdByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Additional cost added successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in addAdditionalCost: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('add-additional-costs-batch')
  @ApiOperation({
    summary: 'Add additional costs in batch',
    description:
      'Fase 4 - Paso 2 (Ejecucion en campo): registra uno o más costos adicionales en una única transacción atómica. Si alguno falla, se revierte el lote completo.',
  })
  @ApiBody({ type: AddAdditionalCostsBatchRequest })
  async addAdditionalCostsBatch(
    @Body() payload: AddAdditionalCostsBatchRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.add-additional-costs-batch',
          { ...payload, createdByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Additional costs added successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in addAdditionalCostsBatch: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('add-work-order-attachment')
  @UseInterceptors(workOrderAttachmentInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Add work order attachments (batch)',
    description:
      'Fase 4 - Paso 3 (Ejecucion en campo): sube uno o varios archivos (máx. 10) de cualquier tipo ' +
      '(imagen, PDF, Word, Excel, ZIP, etc.) y los registra como adjuntos de la OT. Máx. 50 MB por archivo.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['workOrderId', 'createdByUserId', 'files'],
      properties: {
        workOrderId: {
          type: 'string',
          format: 'uuid',
          example: '7f2c1f1c-1f4f-4e17-8e2d-fc21f4d4e123',
        },
        createdByUserId: {
          type: 'string',
          format: 'uuid',
          example: 'b2c3d4e5-f6a7-4b6c-9d8e-1f2a3b4c5d6e',
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description:
            'Archivos adjuntos — cualquier tipo MIME aceptado. Mínimo 1, máximo 10.',
        },
      },
    },
  })
  async addWorkOrderAttachment(
    @Body() body: { workOrderId: string; createdByUserId: string },
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException(
          'Debe adjuntar al menos un archivo en el campo "files".',
        );
      }

      const results: unknown[] = [];

      for (const file of files) {
        // Renombrar cada archivo temporal a nombre definitivo
        const finalFilename = `wo-${body.workOrderId}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
        const finalPath = join(WORK_ORDERS_UPLOAD_DIR, finalFilename);
        renameSync(file.path, finalPath);

        const fileUrl = `$/images/work_orders/${finalFilename}`;
        this.logger.log(`Work order attachment saved: ${fileUrl}`);

        const response = await sendKafkaRequest(
          this.kafkaProxy.send(
            this.workOrderKafkaClient,
            'work-orders.process-work-order.add-work-order-attachment',
            {
              workOrderId: body.workOrderId,
              createdByUserId: this.extractAuthUserId(request),
              fileName: file.originalname,
              fileType: file.mimetype,
              fileUrl,
            },
          ),
        );
        results.push(response);
      }

      return new ApiResponse(
        `${results.length} attachment(s) added successfully`,
        results,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in addWorkOrderAttachment: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('finish-execution')
  @ApiOperation({
    summary: 'Finish field execution',
    description:
      'Fase 4 - Finalización: marca la ejecución técnica como completada en campo (EN_PROCESO → EJECUTADA), habilitando el control de calidad.',
  })
  @ApiBody({ type: ProcessWorkOrderTransitionRequest })
  async finishExecution(
    @Body() payload: ProcessWorkOrderTransitionRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.start-execution',
          {
            ...payload,
            userId: this.extractAuthUserId(request),
            newStatus: payload.newStatus || 'EJECUTADA',
          },
        ),
      );
      return new ApiResponse(
        'Field execution finished successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in finishExecution: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Post('create-quality-control')
  @ApiOperation({
    summary: 'Create quality control',
    description:
      'Fase 5 (Inspeccion de calidad): crea la cabecera del control de calidad para validar ejecucion en campo.',
  })
  @ApiBody({ type: CreateQualityControlRequest })
  async createQualityControl(
    @Body() payload: CreateQualityControlRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.create-quality-control',
          { ...payload, createdByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Quality control created successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in createQualityControl: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('add-quality-control-detail')
  @ApiOperation({
    summary: 'Add quality control detail',
    description:
      'Fase 5 (Inspeccion de calidad): registra el detalle de checklist tecnico de control de calidad.',
  })
  @ApiBody({ type: AddQualityControlDetailRequest })
  async addQualityControlDetail(
    @Body() payload: AddQualityControlDetailRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.add-quality-control-detail',
          { ...payload, createdByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Quality control detail added successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in addQualityControlDetail: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('resolve-quality-control')
  @ApiOperation({
    summary: 'Resolve quality control',
    description:
      'Fase 5 (Gateway de decision): aprueba la OT para cierre (COMPLETADA) o la rechaza tecnicamente (RECHAZADA_TECNICA) para retrabajo.',
  })
  @ApiBody({ type: ResolveQualityControlRequest })
  async resolveQualityControl(
    @Body() payload: ResolveQualityControlRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.resolve-quality-control',
          {
            workOrderId: payload.workOrderId,
            userId: this.extractAuthUserId(request),
            comment: payload.comment,
            newStatus: payload.approved ? 'COMPLETADA' : 'RECHAZADA_TECNICA',
          },
        ),
      );
      return new ApiResponse(
        'Quality control resolved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in resolveQualityControl: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('complete-work-order')
  @ApiOperation({
    summary: 'Complete a work order',
    description:
      'Fase 6 - Paso 1 (Finalizacion y cierre): formaliza el cierre administrativo de la OT y registra fecha de completacion.',
  })
  @ApiBody({ type: ProcessWorkOrderTransitionRequest })
  async completeWorkOrder(
    @Body() payload: ProcessWorkOrderTransitionRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.complete',
          {
            ...payload,
            userId: this.extractAuthUserId(request),
            newStatus: 'COMPLETADA',
          },
        ),
      );
      return new ApiResponse(
        'Work order completed successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in completeWorkOrder: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('register-satisfaction-survey')
  @ApiOperation({
    summary: 'Register satisfaction survey',
    description:
      'Fase 6 - Paso 3 (Encuesta de satisfaccion): registra la retroalimentacion final del cliente sobre la OT cerrada.',
  })
  @ApiBody({ type: RegisterSatisfactionSurveyRequest })
  async registerSatisfactionSurvey(
    @Body() payload: RegisterSatisfactionSurveyRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.register-satisfaction-survey',
          { ...payload, createdByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Satisfaction survey registered successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in registerSatisfactionSurvey: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-detalle-by-numero-orden')
  @ApiOperation({
    summary: 'Get work order detail by order number',
    description:
      'Consulta el detalle completo de la OT para su visualizacion en el portal del cliente.',
  })
  async getOrdenTrabajoDetalleByNumeroOrden(
    @Query('numeroOrden') numeroOrden: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    const response = await sendKafkaRequest(
      this.kafkaProxy.send(
        this.workOrderKafkaClient,
        'work-orders.process-work-order.get-detalle-by-numero-orden',
        { numeroOrden },
      ),
    );
    return new ApiResponse(
      'Work order detail retrieved successfully',
      response,
      request.url,
    );
  }

  @Get('get-tracking-by-numero-orden')
  @ApiOperation({
    summary: 'Get work order tracking by order number',
    description:
      'Consulta el tracking completo de la OT para su visualizacion en el portal del cliente.',
  })
  async getOrdenTrabajoTrackingByNumeroOrden(
    @Query('numeroOrden') numeroOrden: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.get-tracking-by-numero-orden',
          { numeroOrden },
        ),
      );
      return new ApiResponse(
        'Work order tracking retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }

  @Get('get-ordenes-by-solicitud-id')
  @ApiOperation({
    summary: 'Get work orders by request ID',
    description:
      'Consulta las OTs asociadas a una solicitud para su visualizacion en el portal del cliente.',
  })
  async getOrdenesTrabajoBySolicitudId(
    @Query('solicitudId') solicitudId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    const response = await sendKafkaRequest(
      this.kafkaProxy.send(
        this.workOrderKafkaClient,
        'work-orders.process-work-order.get-ordenes-by-solicitud-id',
        { solicitudId },
      ),
    );
    return new ApiResponse(
      'Work orders retrieved successfully',
      response,
      request.url,
    );
  }

  // ─── Personal asignado directamente a la OT ──────────────────────────────────────

  @Post('add-worker')
  @ApiOperation({
    summary: 'Agregar trabajador a OT',
    description:
      'Agrega un trabajador directamente a una OT, uno a uno. Con isResponsible=true se designa como técnico responsable.',
  })
  @ApiBody({ type: AddWorkerToWorkOrderRequest })
  async addWorkerToWorkOrder(
    @Body() payload: AddWorkerToWorkOrderRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.add-worker',
          { ...payload, assignedByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Worker added to work order successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in addWorkerToWorkOrder: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('add-workers-batch')
  @ApiOperation({
    summary: 'Agregar trabajadores a OT en lote',
    description:
      'Agrega uno o más trabajadores a la OT en una única transacción atómica. Si alguno falla, se revierte el lote completo. Con isResponsible=true en un item se designa ese trabajador como técnico responsable.',
  })
  @ApiBody({ type: AddWorkersBatchToWorkOrderRequest })
  async addWorkersBatchToWorkOrder(
    @Body() payload: AddWorkersBatchToWorkOrderRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    console.log(
      'PAYLOAD RECEIVED IN GATEWAY:',
      JSON.stringify(payload, null, 2),
    );
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.add-workers-batch',
          { ...payload, assignedByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Workers added to work order successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in addWorkersBatchToWorkOrder: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('remove-worker')
  @ApiOperation({
    summary: 'Remover trabajador de OT',
    description: 'Remueve (borrado lógico) un trabajador asignado a una OT.',
  })
  @ApiBody({ type: RemoveWorkerFromWorkOrderRequest })
  async removeWorkerFromWorkOrder(
    @Body() payload: RemoveWorkerFromWorkOrderRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.remove-worker',
          { ...payload, removedByUserId: this.extractAuthUserId(request) },
        ),
      );
      return new ApiResponse(
        'Worker removed from work order successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in removeWorkerFromWorkOrder: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  /**
   * POST /process-work-orders/advance-state
   *
   * Endpoint genérico para avanzar el estado de una OT a cualquier estado válido.
   *
   * SRP : este método solo proxea la solicitud — la validación la hace fn_validar_transicion_estado en PostgreSQL.
   * OCP : nuevos estados no requieren cambios aquí; solo en la BD y en WorkOrderConfig.ts del frontend.
   * DIP : no conoce los estados; delega al microservicio work-orders que tiene la lógica de dominio.
   *
   * A diferencia de `receive-work-order` (hardcodeado a PENDIENTE), este endpoint
   * pasa el `newStatus` exactamente como lo envía el cliente autenticado.
   */
  @Post('advance-state')
  @ApiOperation({
    summary: 'Advance work order to any valid state',
    description:
      'Avanza una OT al estado indicado en newStatus. La transición es validada por fn_validar_transicion_estado en PostgreSQL — si es inválida, devuelve error 400.',
  })
  @ApiBody({ type: AdvanceWorkOrderStateRequest })
  async advanceWorkOrderState(
    @Body() payload: AdvanceWorkOrderStateRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.workOrderKafkaClient,
          'work-orders.process-work-order.receive',
          {
            workOrderId: payload.workOrderId,
            newStatus: payload.newStatus, // ← se pasa sin modificar
            userId: this.extractAuthUserId(request),
            comment: payload.comment ?? `Avance manual → ${payload.newStatus}`,
          },
        ),
      );
      return new ApiResponse(
        'Work order state advanced successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in advanceWorkOrderState: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('get-all-work-orders')
  @ApiOperation({
    summary: 'Get all work orders with pagination',
    description:
      'Consulta el listado completo de OTs con paginación para su visualización en el panel administrativo.',
  })
  async getAllWorkOrders(
    @Req() request: Request,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<ApiResponse> {
    // ✅ Convertimos a entero de forma segura con valores por defecto.
    //    offset >= 0 (ya aceptado por el microservicio tras el fix).
    const parsedLimit = limit ? Math.max(1, parseInt(limit, 10)) : 100;
    const parsedOffset = offset ? Math.max(0, parseInt(offset, 10)) : 0;

    const response = await sendKafkaRequest(
      this.kafkaProxy.send(
        this.workOrderKafkaClient,
        'work-orders.process-work-order.get-all-work-orders',
        { limit: parsedLimit, offset: parsedOffset },
      ),
    );
    return new ApiResponse(
      'All work orders retrieved successfully',
      response,
      request.url,
    );
  }
}
