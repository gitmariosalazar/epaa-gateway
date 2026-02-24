import { Module } from '@nestjs/common';
import { KafkaAuthenticationModule } from '../../../../kafka/kafka-authentication.module';
import { CategoryGatewayController } from '../controllers/category.gateway.controller';

@Module({
  imports: [KafkaAuthenticationModule],
  controllers: [CategoryGatewayController],
  providers: [],
})
export class CategoriesModule {}
