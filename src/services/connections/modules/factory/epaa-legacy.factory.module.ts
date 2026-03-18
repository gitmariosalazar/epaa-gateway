import { Module } from '@nestjs/common';
import { RateGatewayModule } from '../rates/infrastructure/modules/rate.gateway.module';
import { ConnectionGatewayModule } from '../connection/infrastructure/modules/connection.gateway.module';
import { ObservationConnectionGatewayModule } from '../observations/infrastructure/modules/observation-connection.gateway.module';
import { PhotoConnectionGatewayModule } from '../images-connections/infrastructure/modules/photo-connection.gateway.module';

@Module({
  imports: [
    RateGatewayModule,
    ConnectionGatewayModule,
    ObservationConnectionGatewayModule,
    PhotoConnectionGatewayModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class ConnectionFactoryModule {}
