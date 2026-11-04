import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';

@Injectable()
export class DailyInterestCronService {
  private readonly logger = new Logger(DailyInterestCronService.name);

  constructor(
    @Inject('EPAA_LEGACY_ACCOUNTING_KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Cron('0 0 0 * * *', {
    name: 'daily-interest-job',
    timeZone: 'America/Guayaquil',
  })
  async handleDailyInterestCron(): Promise<void> {
    this.logger.log(
      '⏰ [CRON 00:00] Iniciando actualización diaria de intereses vía Kafka...',
    );
    try {
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'epaa-legacy.accounting.execute-daily-interest',
          {},
        ),
      );
      this.logger.log(
        `✅ [CRON 00:00] Actualización de intereses completada: ${JSON.stringify(response)}`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `❌ [CRON 00:00] Error al ejecutar actualización diaria de intereses: ${err.message}`,
        err.stack,
      );
    }
  }
}
