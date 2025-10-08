import { Module } from '@nestjs/common';
import { HomeModule } from './app/module/app.module';
import { QRCodeGatewayModule } from './services/qrcode/modules/qrcode/infrastructure/modules/qrcode.gateway.module';
import { QRCodeKafkaModule } from './shared/kafka/qrcode.kafka.module';
import { ReadingGatewayModule } from './services/readings/modules/reading/infrastructure/modules/reading.gateway.module';
import { ReadingLegacyModule } from './services/epaa-legacy/modules/readings/infrastructure/modules/reading.gateway.module';
import { ObservationsGatewayModule } from './services/readings/modules/observations/infrastructure/modules/observations.gateway.module';

@Module({
  imports: [HomeModule, QRCodeKafkaModule, QRCodeGatewayModule, ReadingGatewayModule, ReadingLegacyModule, ObservationsGatewayModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
