import { Module } from '@nestjs/common';
import { ReadingLegacyGatewayController } from '../controller/reading-legacy.gateway.controller';
import { ReadingAnalyticsLegacyGatewayController } from '../controller/reading-analytics-legacy.gateway.controller';
import { KafkaEpaaLegacyModule } from '../../../kafka/kafka-epaa-legacy.module';

@Module({
  imports: [KafkaEpaaLegacyModule],
  controllers: [
    ReadingLegacyGatewayController,
    ReadingAnalyticsLegacyGatewayController,
  ],
  providers: [],
  exports: [],
})
export class ReadingLegacyModule {}
