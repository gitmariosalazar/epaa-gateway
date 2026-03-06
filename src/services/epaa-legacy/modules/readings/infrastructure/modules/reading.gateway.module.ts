import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReadingLegacyGatewayController } from '../controller/reading-legacy.gateway.controller';
import { KafkaEpaaLegacyModule } from '../../../kafka/kafka-epaa-legacy.module';

@Module({
  imports: [KafkaEpaaLegacyModule],
  controllers: [ReadingLegacyGatewayController],
  providers: [],
  exports: [],
})
export class ReadingLegacyModule {}
