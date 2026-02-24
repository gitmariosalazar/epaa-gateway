import { Module } from '@nestjs/common';
import { KafkaAuthenticationModule } from '../../../../kafka/kafka-authentication.module';
import { UserGatewayController } from '../controllers/user.gateway.controller';

@Module({
  imports: [KafkaAuthenticationModule],
  controllers: [UserGatewayController],
  providers: [],
  exports: [],
})
export class UserGatewayModule {}
