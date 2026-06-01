import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../shared/kafka/kafka-proxy.service';
import { sendKafkaRequest } from '../../../../../shared/utils/kafka/send.kafka.request';
import { ApiResponse } from '../../../../../shared/errors/responses/ApiResponse';
import { SendNotificationRequest } from '../../domain/schemas/dto/request/send-notification.request';

/**
 * NotificationGatewayController
 * Expone los endpoints REST de notificaciones para el frontend.
 * Delega toda la lógica al microservicio de notificaciones vía Kafka.
 */
@Controller('notifications')
@ApiTags('notifications')
export class NotificationGatewayController {
  private readonly logger = new Logger(NotificationGatewayController.name);

  constructor(
    @Inject('GATEWAY_NOTIFICATIONS_KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  // ── Consultas del frontend ─────────────────────────────────────────────────

  @Get('unread')
  @ApiOperation({ summary: 'Notificaciones no leídas de un usuario (campanita)' })
  @ApiQuery({ name: 'userId', type: String, description: 'UUID del usuario' })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 20 })
  @ApiQuery({ name: 'offset', type: Number, required: false, example: 0 })
  async getUnread(
    @Query('userId') userId: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    this.logger.log(`[GET /notifications/unread] user: ${userId}`);
    return await sendKafkaRequest(
      this.kafkaProxy.send(
        this.kafkaClient,
        'notifications.get_unread',
        { userId, limit: Number(limit), offset: Number(offset) },
      ),
    );
  }

  @Get('all')
  @ApiOperation({ summary: 'Bandeja completa de notificaciones de un usuario' })
  @ApiQuery({ name: 'userId', type: String, description: 'UUID del usuario' })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 30 })
  @ApiQuery({ name: 'offset', type: Number, required: false, example: 0 })
  async getAll(
    @Query('userId') userId: string,
    @Query('limit') limit = 30,
    @Query('offset') offset = 0,
  ) {
    this.logger.log(`[GET /notifications/all] user: ${userId}`);
    return await sendKafkaRequest(
      this.kafkaProxy.send(
        this.kafkaClient,
        'notifications.get_all',
        { userId, limit: Number(limit), offset: Number(offset) },
      ),
    );
  }

  @Get('count')
  @ApiOperation({ summary: 'Conteo de no leídas — badge numérico de la campanita' })
  @ApiQuery({ name: 'userId', type: String, description: 'UUID del usuario' })
  async getUnreadCount(@Query('userId') userId: string) {
    this.logger.log(`[GET /notifications/count] user: ${userId}`);
    return await sendKafkaRequest(
      this.kafkaProxy.send(this.kafkaClient, 'notifications.get_unread_count', userId),
    );
  }

  // ── Mutaciones ─────────────────────────────────────────────────────────────

  @Patch(':notificationId/read')
  @ApiOperation({ summary: 'Marcar una notificación específica como leída' })
  @ApiParam({ name: 'notificationId', type: String, description: 'UUID de la notificación' })
  @ApiQuery({ name: 'userId', type: String, description: 'UUID del usuario propietario' })
  async markAsRead(
    @Param('notificationId', new ParseUUIDPipe()) notificationId: string,
    @Query('userId') userId: string,
  ) {
    this.logger.log(`[PATCH /notifications/${notificationId}/read] user: ${userId}`);
    return await sendKafkaRequest(
      this.kafkaProxy.send(this.kafkaClient, 'notifications.mark_as_read', { notificationId, userId }),
    );
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar TODAS las notificaciones del usuario como leídas' })
  @ApiQuery({ name: 'userId', type: String, description: 'UUID del usuario' })
  async markAllAsRead(@Query('userId') userId: string) {
    this.logger.log(`[PATCH /notifications/read-all] user: ${userId}`);
    return await sendKafkaRequest(
      this.kafkaProxy.send(this.kafkaClient, 'notifications.mark_all_as_read', userId),
    );
  }

  // ── Despacho de notificaciones ─────────────────────────────────────────────

  @Post('send')
  @ApiOperation({
    summary: 'Enviar una notificación (público)',
    description:
      'Despacha una notificación a través de uno o varios canales (EMAIL, WHATSAPP, IN_APP, SMS, PUSH). ' +
      'Para múltiples canales simultáneos separa con coma (ej: "EMAIL,WHATSAPP"). ' +
      'El destinatario se pasa dentro de `metadata` (ej: { "to": "email@ejemplo.com" }).',
  })
  @ApiBody({ type: SendNotificationRequest })
  async sendNotification(
    @Req() request: Request,
    @Body() body: SendNotificationRequest,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `[POST /notifications/send] userId: ${body.userId}, channel: ${body.channel ?? 'IN_APP'}, title: "${body.title}"`,
      );
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'notifications.send', body),
      );
      this.logger.log(`[POST /notifications/send] dispatched — id(s): ${response}`);
      return new ApiResponse(
        'Notificación enviada correctamente',
        { notificationIds: response },
        request.url,
      );
    } catch (error) {
      throw new RpcException(error as string | object);
    }
  }
}
