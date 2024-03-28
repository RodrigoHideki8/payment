import { WebhookLog } from '@/domain/contracts/infra-layer/payment-gateway/webhook-logger.contract';
import { Injectable, Provider } from '@nestjs/common';
import { Model } from 'mongoose';
import { Observable, of, mergeMap } from 'rxjs';
import { WebhookLogDocument } from './models/webhook-logger.model';
import { InjectModel } from '@nestjs/mongoose';
import { LoggerRepository } from '@/domain/contracts/infra-layer/repository/logger.repository';

@Injectable()
export class WebhookLoggerRepositoryImpl extends LoggerRepository<WebhookLog> {
  constructor(
    @InjectModel('webhook-log')
    readonly model: Model<WebhookLogDocument>,
  ) {
    super();
  }

  capture(logger: WebhookLog): Observable<void> {
    const _promise = this.model.create([{ ...logger }]);
    return of(_promise).pipe(mergeMap(() => of(void 0)));
  }
}

export const WebhookLoggerRepositoryProvider: Provider = {
  provide: LoggerRepository,
  useClass: WebhookLoggerRepositoryImpl,
};
