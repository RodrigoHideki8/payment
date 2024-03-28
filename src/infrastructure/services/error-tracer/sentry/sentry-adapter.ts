import { ErrorTracerContract } from '@/domain/contracts/infra-layer/error-tracer/error-tracer.contract';
import { Injectable, OnModuleInit, Provider } from '@nestjs/common';

import * as Sentry from '@sentry/node';
import { Observable } from 'rxjs';

@Injectable()
export class SentryAdapter implements ErrorTracerContract, OnModuleInit {
  captureException(exception: Error): Observable<void> {
    return new Observable((subscriber) => {
      try {
        Sentry.captureException(exception);
        subscriber.next();
      } catch (e) {
        subscriber.error(e);
      }
    });
  }

  captureMessage(message: string): Observable<void> {
    return new Observable((subscriber) => {
      try {
        Sentry.captureMessage(message);
        subscriber.next();
      } catch (e) {
        subscriber.error(e);
      }
    });
  }

  onModuleInit(): any {
    Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0 });
  }
}

export const SentryAdapterProvider: Provider = {
  provide: ErrorTracerContract,
  useClass: SentryAdapter,
};
