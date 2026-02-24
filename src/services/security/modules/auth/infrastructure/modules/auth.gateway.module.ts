import { Module } from '@nestjs/common';
import { KafkaAuthenticationModule } from '../../../../kafka/kafka-authentication.module';
import { AuthGatewayController } from '../controllers/auth.gateway.controller';

@Module({
  imports: [KafkaAuthenticationModule],
  exports: [],
  controllers: [AuthGatewayController],
})
export class AuthGatewayModule {}
