import { Module } from '@nestjs/common';
import { KafkaWorkerModule } from '../../../../kafka/kafka_worker.module';
import { WorkerGatewayController } from '../controllers/worker.gateway.controller';

@Module({
  imports: [KafkaWorkerModule],
  controllers: [WorkerGatewayController],
  providers: [],
  exports: [],
})
export class WorkerGatewayModule {}
