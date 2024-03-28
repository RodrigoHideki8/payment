import { Global, Module } from '@nestjs/common';
import { SentryAdapterProvider } from '@/infrastructure/services/error-tracer/sentry/sentry-adapter';

@Global()
@Module({
  imports: [],
  providers: [SentryAdapterProvider],
  exports: [SentryAdapterProvider],
})
export class SentryModule {}
