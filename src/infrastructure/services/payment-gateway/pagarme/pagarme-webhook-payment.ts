import { PaymentStatus } from '@/domain/entities';
import { Injectable, Provider } from '@nestjs/common';
import {
  WebhookPaymentTransaction,
  WebhookPaymentTransactionInputType,
  WebhookPaymentTransactionOutputType,
} from '@/domain/contracts/infra-layer/payment-gateway/webhook-transaction.contract';
import { PaymentByTransactionIdQuery } from '@/application/payment/queries/models/payment-by-transaction-id.query';

@Injectable()
export class PaymentWebhookTransactionPagarme extends WebhookPaymentTransaction {
  execute(
    input: WebhookPaymentTransactionInputType,
  ): Promise<WebhookPaymentTransactionOutputType> {
    const lastTransaction = input.payload.data.charges[0].last_transaction;

    let status = undefined;

    if (
      lastTransaction.status === 'captured' ||
      lastTransaction.status === 'paid'
    ) {
      status = PaymentStatus.APPROVED;
    } else if (
      lastTransaction.status === 'refunded' ||
      lastTransaction.status === 'voided'
    ) {
      status = PaymentStatus.REFUNDED;
    } else {
      status = PaymentStatus.REFUSED;
    }

    return Promise.resolve({
      paymentStatus: status,
      paymentQuery: new PaymentByTransactionIdQuery(
        input.payload.data.charges[0].id,
        input.tenantId,
      ),
    });
  }
}

export const WebhookPaymentPagarmeProvider: Provider = {
  provide: WebhookPaymentTransaction,
  useClass: PaymentWebhookTransactionPagarme,
};
