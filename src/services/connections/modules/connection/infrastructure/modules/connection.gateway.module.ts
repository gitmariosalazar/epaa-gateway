import { Module } from '@nestjs/common';
import { ConnectionGatewayController } from '../controllers/connection.gateway.controller';
import { ConnectionStateGatewayController } from '../controllers/connection-state.gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';
import { RealtimeModule } from '../../../../../../shared/realtime/realtime.module';
import { RealtimeConnectionNotifierAdapter } from '../adapters/connection-reading-notifier.adapter';
import { CONNECTION_REALTIME_NOTIFIER_PORT } from '../../application/ports/connection-realtime-notifier.port';

@Module({
  imports: [KafkaConnectionsModule, RealtimeModule],
  controllers: [ConnectionGatewayController, ConnectionStateGatewayController],
  providers: [
    {
      provide: CONNECTION_REALTIME_NOTIFIER_PORT,
      useClass: RealtimeConnectionNotifierAdapter,
    },
  ],
  exports: [],
})
export class ConnectionGatewayModule {}
