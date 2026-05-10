import { Global, Module } from '@nestjs/common';
import { KafkaProxyService } from './kafka-proxy.service';

@Global()
@Module({
  providers: [KafkaProxyService],
  exports: [KafkaProxyService],
})
export class KafkaProxyModule {}
