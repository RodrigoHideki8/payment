import { Global, Module } from '@nestjs/common';
import { SentryModule } from '@/infrastructure/services/error-tracer/sentry/sentry.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ExceptionInterceptor } from '@/infrastructure/services/error-tracer/exception.interceptor';

@Global()
@Module({
  imports: [SentryModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ExceptionInterceptor,
    },
  ],
})
export class ErrorTracerModule {}
