import { Module } from '@nestjs/common';
import { TrashRateReportGatewayController } from '../controllers/trash-rate-report-gateway.controller';
import { KafkaTrashRateModule } from './kafka-trash-rate.module';

/**
 * Trash-rate bounded-context module.
 * Imports KafkaTrashRateModule (owns TRASH_RATE_KAFKA_CLIENT) so the
 * controller always uses the correct, isolated ClientKafka instance.
 */
@Module({
  imports: [KafkaTrashRateModule],
  controllers: [TrashRateReportGatewayController],
  providers: [],
  exports: [],
})
export class TrashRateReportGatewayModule {}
