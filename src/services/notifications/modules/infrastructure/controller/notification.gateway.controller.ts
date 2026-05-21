import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Inject,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../shared/kafka/kafka-proxy.service';
import { sendKafkaRequest } from '../../../../../shared/utils/kafka/send.kafka.request';

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
}
