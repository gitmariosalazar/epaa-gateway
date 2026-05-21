import { Module } from '@nestjs/common';
import { NotificationGatewayController } from '../infrastructure/controller/notification.gateway.controller';
import { KafkaNotificationsModule } from '../../kafka/kafka-notifications.module';
import { KafkaProxyModule } from '../../../../shared/kafka/kafka-proxy.module';

/**
 * NotificationGatewayModule
 * Registra el controller y el cliente Kafka de notificaciones en el gateway.
 * SRP: solo administra el transporte de notificaciones en el gateway.
 */
@Module({
  imports: [KafkaNotificationsModule, KafkaProxyModule],
  controllers: [NotificationGatewayController],
  providers: [],
  exports: [],
})
export class NotificationGatewayModule {}
