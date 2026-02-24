import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { CompanyGatewayController } from '../controllers/company.gateway.controller';
import { KafkaCustomersModule } from '../../../../kafka/kafka-customers.module';

@Module({
  imports: [KafkaCustomersModule],
  controllers: [CompanyGatewayController],
  providers: [],
  exports: [],
})
export class CompanyGatewayModule {}
