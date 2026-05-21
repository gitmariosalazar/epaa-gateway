import { Module } from '@nestjs/common';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';
import { PaymentConfirmationGatewayController } from '../controllers/payment-confirmation.gateway.controller';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [PaymentConfirmationGatewayController],
})
export class PaymentConfirmationGatewayModule {}
