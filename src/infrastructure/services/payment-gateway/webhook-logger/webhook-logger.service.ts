import {
  WebhookLog,
  WebhookLoggerContract,
} from '@/domain/contracts/infra-layer/payment-gateway/webhook-logger.contract';
import { LoggerRepository } from '@/domain/contracts/infra-layer/repository/logger.repository';
import { Injectable, Provider } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class WebhookLoggerService extends WebhookLoggerContract {
  constructor(private readonly loggerRepository: LoggerRepository<WebhookLog>) {
    super();
  }

  captureLog(webhookLogger: WebhookLog): Observable<void> {
    return this.loggerRepository.capture(webhookLogger);
  }
}

export const WebhookLoggerServiceProvider: Provider = {
  provide: WebhookLoggerContract,
  useClass: WebhookLoggerService,
};
