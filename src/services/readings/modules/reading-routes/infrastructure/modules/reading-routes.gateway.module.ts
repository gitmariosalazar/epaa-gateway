import { Module } from '@nestjs/common';
import { ReadingGatewayModule } from '../../../reading/infrastructure/modules/reading.gateway.module';
import { ReadingRouteCatalogGatewayController } from '../controller/reading-route-catalog.gateway.controller';
import { RouteDispatchGatewayController } from '../controller/route-dispatch.gateway.controller';
import { RouteResolutionGatewayController } from '../controller/route-resolution.gateway.controller';
import { MobileRouteSyncGatewayController } from '../controller/mobile-route-sync.gateway.controller';

@Module({
  imports: [
    ReadingGatewayModule,
  ],
  controllers: [
    ReadingRouteCatalogGatewayController,
    RouteDispatchGatewayController,
    RouteResolutionGatewayController,
    MobileRouteSyncGatewayController,
  ],
  providers: [],
  exports: [],
})
export class ReadingRoutesGatewayModule {}
