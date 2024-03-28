import { UniqueIdentifier } from '@/domain/entities/types';
import { Observable } from 'rxjs';

export enum WebhookProccessingStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export type WebhookLog = {
  tenantId: string;
  gatewayId: UniqueIdentifier;
  payload: Record<string, any>;
  createdAt: Date;
  status: WebhookProccessingStatus;
  reason: string;
};

export abstract class WebhookLoggerContract {
  abstract captureLog(webhookLogger: WebhookLog): Observable<void>;
}
