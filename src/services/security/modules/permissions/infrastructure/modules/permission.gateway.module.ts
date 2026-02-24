import { Module } from '@nestjs/common';
import { KafkaAuthenticationModule } from '../../../../kafka/kafka-authentication.module';
import { PermissionGatewayController } from '../controllers/permission.gateway.controller';

@Module({
  imports: [KafkaAuthenticationModule],
  controllers: [PermissionGatewayController],
  providers: [],
  exports: [],
})
export class PermissionGatewayModule {}
