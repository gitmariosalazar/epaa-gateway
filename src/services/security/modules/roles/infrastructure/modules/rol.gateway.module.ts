import { Module } from '@nestjs/common';
import { KafkaAuthenticationModule } from '../../../../kafka/kafka-authentication.module';
import { RolGatewayController } from '../controllers/rol.gateway.controller';

@Module({
  imports: [KafkaAuthenticationModule],
  controllers: [RolGatewayController],
  providers: [],
})
export class RolGatewayModule {}
