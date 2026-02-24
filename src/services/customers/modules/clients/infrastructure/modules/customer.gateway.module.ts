import { Module } from '@nestjs/common';
import { CustomerGatewayController } from '../controllers/customer.gateway.controller';
import { ClientsModule } from '@nestjs/microservices';
import { KafkaCustomersModule } from '../../../../kafka/kafka-customers.module';

@Module({
  imports: [KafkaCustomersModule],
  controllers: [CustomerGatewayController],
  providers: [],
  exports: [],
})
export class CustomerGatewayModule {}
