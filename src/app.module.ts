import { Module } from '@nestjs/common';
import { HomeModule } from './app/module/app.module';
import { QRCodeGatewayModule } from './services/qrcode/modules/qrcode/infrastructure/modules/qrcode.gateway.module';
import { QRCodeKafkaModule } from './shared/kafka/qrcode.kafka.module';
import { ReadingGatewayModule } from './services/readings/modules/reading/infrastructure/modules/reading.gateway.module';
import { ReadingLegacyModule } from './services/epaa-legacy/modules/readings/infrastructure/modules/reading.gateway.module';
import { ObservationsGatewayModule } from './services/readings/modules/observations/infrastructure/modules/observations.gateway.module';
import { PhotoReadingGatewayModule } from './services/readings/modules/images-readings/infrastructure/modules/photo-reading.gateway.module';
import { LocationGatewayModule } from './services/readings/modules/location/infrastructure/modules/location.gateway.module';
import { CustomerGatewayModule } from './services/customers/modules/clients/infrastructure/modules/customer.gateway.module';
import { CompanyGatewayModule } from './services/customers/modules/companies/infrastructure/modules/company.gateway.module';
import { ConnectionGatewayModule } from './services/connections/modules/connection/infrastructure/modules/connection.gateway.module';
import { PropertyGatewayModule } from './services/properties/modules/property/infrastructure/modules/property.gateway.module';
import { ObservationConnectionGatewayModule } from './services/connections/modules/observations/infrastructure/modules/observation-connection.gateway.module';
import { PhotoConnectionGatewayModule } from './services/connections/modules/images-connections/infrastructure/modules/photo-connection.gateway.module';
import { WorkOrderTypeGatewayModule } from './services/work-orders/modules/work-order-type/infrastructure/modules/work-order-type.gateway.module';
import { WorkOrderGatewayModule } from './services/work-orders/modules/work-order/infrastructure/modules/work-order.gateway.module';

@Module({
  imports: [
    HomeModule,
    QRCodeKafkaModule,
    QRCodeGatewayModule,
    ReadingGatewayModule,
    ReadingLegacyModule,
    ObservationsGatewayModule,
    PhotoReadingGatewayModule,
    LocationGatewayModule,
    CustomerGatewayModule,
    CompanyGatewayModule,
    ConnectionGatewayModule,
    PropertyGatewayModule,
    ObservationConnectionGatewayModule,
    PhotoConnectionGatewayModule,
    WorkOrderTypeGatewayModule,
    WorkOrderGatewayModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
