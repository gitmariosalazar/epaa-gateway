import { Module } from '@nestjs/common';
import { KafkaAuthenticationModule } from '../../../../kafka/kafka-authentication.module';
import { KafkaCustomersModule } from '../../../../../customers/kafka/kafka-customers.module';
import { CustomerGatewayController } from '../controllers/customer.gateway.controller';

@Module({
  imports: [KafkaAuthenticationModule, KafkaCustomersModule],
  controllers: [CustomerGatewayController],
  providers: [],
  exports: [],
})
export class SecurityCustomerGatewayModule {}
