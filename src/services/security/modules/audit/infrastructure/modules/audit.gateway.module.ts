import { Module } from '@nestjs/common';
import { KafkaAuthenticationModule } from '../../../../kafka/kafka-authentication.module';
import { AuditGatewayController } from '../controllers/audit.gateway.controller';

@Module({
  imports: [KafkaAuthenticationModule],
  controllers: [AuditGatewayController],
  providers: [],
  exports: [],
})
export class AuditGatewayModule {}
