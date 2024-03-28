import { IEntity } from '@domain/entities/entity';
import { UniqueIdentifier } from '@domain/entities/types';

export enum WebhookType {
  PAYMENT_NOTIFIACATION = 'payment-notification',
}

export enum WebhookRetryStrategy {
  NONE = 'none',
  EXPONENTIAL = 'exponential-retries',
  SEQUENTIAL = 'sequential-retries',
  INCREMENTAL = 'incremental-retries',
}

export interface IWebhookRetry {
  strategy: Required<WebhookRetryStrategy>;
  offset: Required<number>;
}

export interface IWebhook extends IEntity {
  tenantId: UniqueIdentifier;
  endpoint: Required<string>;
  type: Required<WebhookType>;
  retry: IWebhookRetry;
}
