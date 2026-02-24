import { Module } from '@nestjs/common';
import { KafkaAuthenticationModule } from '../../../../kafka/kafka-authentication.module';
import { UserEmployeeGatewayController } from '../controllers/user-employee.gateway.controller';

@Module({
  imports: [KafkaAuthenticationModule],
  controllers: [UserEmployeeGatewayController],
  providers: [],
  exports: [],
})
export class UserEmployeeGatewayModule {}
