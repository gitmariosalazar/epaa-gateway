import { Module } from '@nestjs/common';
import { ReadingLegacyModule } from '../readings/infrastructure/modules/reading.gateway.module';
import { TrashRateReportGatewayModule } from '../trash/infrastructure/modules/trash-rate-report.gateway.module';

@Module({
  imports: [ReadingLegacyModule, TrashRateReportGatewayModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class EpaaLegacyFactoryModule {}
