import { Global, Module } from '@nestjs/common';
import { WinstonAdapter } from '@/infrastructure/services/logger/adapters/winston.adapter';

@Global()
@Module({
  imports: [],
  providers: [WinstonAdapter],
  exports: [WinstonAdapter],
})
export class LoggerModule {}
