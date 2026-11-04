import { Module } from '@nestjs/common';
import { KafkaEpaaLegacyModule } from '../../../kafka/kafka-epaa-legacy.module';
import { AccountingLegacyGatewayController } from '../controllers/accounting-legacy.gateway.controller';
import { DailyInterestCronService } from '../jobs/daily-interest.cron.service';

@Module({
  imports: [KafkaEpaaLegacyModule],
  controllers: [AccountingLegacyGatewayController],
  providers: [DailyInterestCronService],
  exports: [DailyInterestCronService],
})
export class AccountingLegacyModule {}
