import { Module } from '@nestjs/common';
import { RateGatewayModule } from '../rates/infrastructure/modules/rate.gateway.module';
import { ConnectionGatewayModule } from '../connection/infrastructure/modules/connection.gateway.module';
import { ObservationConnectionGatewayModule } from '../observations/infrastructure/modules/observation-connection.gateway.module';
import { PhotoConnectionGatewayModule } from '../images-connections/infrastructure/modules/photo-connection.gateway.module';
import { RequestGatewayModule } from '../requests/infrastructure/modules/request.gateway.module';
import { ConnectionDocumentGatewayModule } from '../documents/infrastructure/modules/connection-document.gateway.module';
import { InspectionInvoiceGatewayModule } from '../inspection-invoice/infrastructure/modules/inspection-invoice.gateway.module';
import { DocumentValidationGatewayModule } from '../document-validation/infrastructure/modules/document-validation.gateway.module';
import { PaymentConfirmationGatewayModule } from '../payment-confirmation/infrastructure/modules/payment-confirmation.gateway.module';
import { InspectionReportGatewayModule } from '../inspection-report/infrastructure/modules/inspection-report.gateway.module';
import { ContractsGatewayModule } from '../contracts/infrastructure/modules/contracts.gateway.module';
import { CadastralGatewayModule } from '../cadastral/infrastructure/modules/cadastral.gateway.module';

@Module({
  imports: [
    // Módulos existentes
    RateGatewayModule,
    ConnectionGatewayModule,
    ObservationConnectionGatewayModule,
    PhotoConnectionGatewayModule,
    RequestGatewayModule,
    ConnectionDocumentGatewayModule,
    InspectionInvoiceGatewayModule,
    // Nuevos módulos del proceso BPMN (Fases 3, 5, 8-9, 10-11, 14)
    DocumentValidationGatewayModule,
    PaymentConfirmationGatewayModule,
    InspectionReportGatewayModule,
    ContractsGatewayModule,
    CadastralGatewayModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class ConnectionFactoryModule {}

