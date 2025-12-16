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
import { WorkTypeGatewayModule } from './services/work-orders/modules/work-order-type/infrastructure/modules/work-type.gateway.module';
import { WorkOrderGatewayModule } from './services/work-orders/modules/work-order/infrastructure/modules/work-order.gateway.module';
import { WorkOrderHistoryGatewayModule } from './services/work-orders/modules/work-order-history/infrastructure/modules/work-order-history.gateway.module';
import { WorkOrderObservationGatewayModule } from './services/work-orders/modules/work-order-observation/infrastructure/modules/work-order-observation.gateway.module';
import { InventoryGatewayModule } from './services/sigame-legacy/modules/inventory/modules/inventory.gateway.module';
import { WorkerGatewayModule } from './services/workers/modules/workers/infrastructure/modules/worker.gateway.module';
import { DetailWorkOrderMaterialGatewayModule } from './services/work-orders/modules/product-details/infrastructure/modules/detail-work-order-material.gateway.module';
import { WorkOrderWorkerAssignmentGatewayModule } from './services/work-orders/modules/worker-assignment/infrastructure/modules/work-order-worker-assignment.gateway.module';
import { PostgresqlWorkOrderAttachmentsGatewayModule } from './services/work-orders/modules/work-order-attachments/infrastructure/modules/postgresql.work-order-attachments.gateway.module';

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
    WorkTypeGatewayModule,
    WorkOrderGatewayModule,
    WorkOrderObservationGatewayModule,
    WorkOrderHistoryGatewayModule,
    InventoryGatewayModule,
    WorkerGatewayModule,
    DetailWorkOrderMaterialGatewayModule,
    WorkOrderWorkerAssignmentGatewayModule,
    PostgresqlWorkOrderAttachmentsGatewayModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
