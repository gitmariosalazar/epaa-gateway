import { Module } from '@nestjs/common';
import { HomeModule } from './app/module/app.module';
import { QRCodeGatewayModule } from './services/qrcode/modules/qrcode/infrastructure/modules/qrcode.gateway.module';
import { QRCodeKafkaModule } from './shared/kafka/qrcode.kafka.module';

@Module({
  imports: [HomeModule, QRCodeKafkaModule, QRCodeGatewayModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
