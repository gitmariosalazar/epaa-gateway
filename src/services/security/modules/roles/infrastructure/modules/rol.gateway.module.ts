import { Module } from '@nestjs/common';
import { KafkaAuthenticationModule } from '../../../../kafka/kafka-authentication.module';
import { RolGatewayController } from '../controllers/rol.gateway.controller';
import { PositionGatewayController } from '../controllers/position.gateway.controller';

@Module({
  imports: [KafkaAuthenticationModule],
  controllers: [RolGatewayController, PositionGatewayController],
  providers: [],
})
export class RolGatewayModule {}
