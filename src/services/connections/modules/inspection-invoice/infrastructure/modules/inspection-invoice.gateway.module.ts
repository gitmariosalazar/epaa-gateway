import { Module } from '@nestjs/common';
import { KafkaConnectionsModule } from '../../../../kafka/kafka-connections.module';
import { InspectionInvoiceGatewayController } from '../controllers/inspection-invoice.gateway.controller';

@Module({
  imports: [
    // Import other modules if needed
    KafkaConnectionsModule,
  ],
  controllers: [
    // Add your controllers here
    InspectionInvoiceGatewayController,
  ],
  providers: [
    // Add your services/providers here
  ],
})
export class InspectionInvoiceGatewayModule {}
