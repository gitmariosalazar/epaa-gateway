import { Module } from '@nestjs/common';
import { ReadingLegacyModule } from '../readings/infrastructure/modules/reading.gateway.module';
import { TrashRateReportGatewayModule } from '../trash/infrastructure/modules/trash-rate-report.gateway.module';
import { AccountingLegacyModule } from '../accounting/infrastructure/modules/accounting-legacy.gateway.module';
import { MigrationLegacyGatewayModule } from '../migration/infrastructure/modules/migration-legacy.gateway.module';

@Module({
  imports: [
    ReadingLegacyModule,
    TrashRateReportGatewayModule,
    AccountingLegacyModule,
    MigrationLegacyGatewayModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class EpaaLegacyFactoryModule {}
