import { PaymentStatus } from '@/domain/entities';
import { PaymentTransaction } from './payment-gateway.contract';
import { IQuery } from '@nestjs/cqrs';

export type WebhookPaymentTransactionInputType = {
  tenantId: string;
  payload: Record<string, any>;
};
export type WebhookPaymentTransactionOutputType = {
  paymentStatus: PaymentStatus;
  paymentQuery: IQuery;
};

export abstract class WebhookPaymentTransaction
  implements
    PaymentTransaction<
      WebhookPaymentTransactionInputType,
      WebhookPaymentTransactionOutputType
    >
{
  abstract execute(
    input: WebhookPaymentTransactionInputType,
  ): Promise<WebhookPaymentTransactionOutputType>;
}
