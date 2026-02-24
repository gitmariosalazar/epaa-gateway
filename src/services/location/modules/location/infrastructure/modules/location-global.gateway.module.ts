import { Module } from '@nestjs/common';
import { KafkaLocationGlobalModule } from '../../../../kafka/kafka-authentication.module';
import { LocationGlobalGatewayController } from '../controllers/location.gateway.controller';

@Module({
  imports: [KafkaLocationGlobalModule],
  controllers: [LocationGlobalGatewayController],
  providers: [],
  exports: [],
})
export class LocationGlobalGatewayModule {}
