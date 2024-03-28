// @index('./*.ts', f => `export * from '${f.path}'`)
export * from './payment-approved.event';
export * from './payment-canceled.event';
export * from './payment-created.event';
export * from './payment-pre-approved.event';
export * from './payment-refused.event';
export * from './payment-approved-not-content.event';
export const QUEUE_BASE_NAME = 'payment-api.payment.transaction';
export const QUEUE_WEBHOOK_PAGARME = 'webhook-pagarme';
