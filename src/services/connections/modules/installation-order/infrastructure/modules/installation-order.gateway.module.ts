import { Module } from '@nestjs/common';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';
import { InstallationOrderGatewayController } from '../controllers/installation-order.gateway.controller';

@Module({
  imports: [KafkaConnectionsModule],
  controllers: [InstallationOrderGatewayController],
})
export class InstallationOrderGatewayModule {}
