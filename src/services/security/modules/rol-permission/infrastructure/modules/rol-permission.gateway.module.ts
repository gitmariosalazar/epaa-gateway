import { Module } from '@nestjs/common';
import { KafkaAuthenticationModule } from '../../../../kafka/kafka-authentication.module';
import { RolPermissionGatewayController } from '../controllers/rol-permission.gateway.controller';

@Module({
  imports: [KafkaAuthenticationModule],
  controllers: [RolPermissionGatewayController],
  providers: [],
})
export class RolPermissionGatewayModule {}
