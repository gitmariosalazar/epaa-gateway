import { Module } from '@nestjs/common';
import { KafkaEpaaLegacyModule } from '../../../kafka/kafka-epaa-legacy.module';
import { AccountingLegacyGatewayController } from '../controllers/accounting-legacy.gateway.controller';

@Module({
  imports: [KafkaEpaaLegacyModule],
  controllers: [AccountingLegacyGatewayController],
  providers: [],
  exports: [],
})
export class AccountingLegacyModule {}
