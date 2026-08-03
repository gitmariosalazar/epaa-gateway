import { Module } from '@nestjs/common';
import { KafkaEpaaLegacyModule } from '../../../kafka/kafka-epaa-legacy.module';
import { MigrationLegacyGatewayController } from '../controllers/migration-legacy.gateway.controller';

@Module({
  imports: [KafkaEpaaLegacyModule],
  controllers: [MigrationLegacyGatewayController],
  providers: [],
  exports: [],
})
export class MigrationLegacyGatewayModule {}
