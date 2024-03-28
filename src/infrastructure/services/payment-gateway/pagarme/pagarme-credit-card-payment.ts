import { Injectable, Provider } from '@nestjs/common';
import {
  CreditCardPaymentInputType,
  CreditCardPaymentOutputType,
  CreditCardPaymentTransaction,
  CancelPaymentInputType,
  CancelPaymentOutputType,
  CancelCreditCardPaymentTransaction,
} from '@/domain/contracts/infra-layer/payment-gateway';
import { PaymentStatus } from '@/domain/entities';
import { PagarmeService } from '@/infrastructure/services/payment-gateway/pagarme/pagarme.service';
import { firstValueFrom, map, forkJoin } from 'rxjs';
import { OrderPagarmeRequest, OrderPagarmeResponse } from './types';
import { removeSpecialCharacters } from '@/domain/utils/string.utils';

@Injectable()
export class CreateCreditCardTransactionPagarme extends CreditCardPaymentTransaction {
  constructor(private readonly pagarmeService: PagarmeService) {
    super();
  }

  async execute(
    input: CreditCardPaymentInputType,
  ): Promise<CreditCardPaymentOutputType> {
    const {
      orderId,
      softDescription,
      buyer,
      installments,
      amount,
      gateway,
      payments,
    } = input;

    const orderPagarmeRequest: OrderPagarmeRequest =
      this.pagarmeService.mapToCreditCard(
        orderId,
        removeSpecialCharacters(softDescription),
        buyer,
        installments,
        amount,
        gateway,
        payments,
      );

    return await firstValueFrom(
      this.pagarmeService.createOrder(gateway, orderPagarmeRequest).pipe(
        map((data: OrderPagarmeResponse) => {
          if (this.hasSameStatus(data.charges.map((charge) => charge.status))) {
            const lastTransaction = data.charges[0].last_transaction;
            let status = undefined;

            if (
              lastTransaction.status === 'authorized_pending_capture' ||
              lastTransaction.status === 'waiting_capture' ||
              lastTransaction.status === 'waiting_cancellation'
            ) {
              status = PaymentStatus.WAITING;
            } else if (
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

            const response: CreditCardPaymentOutputType = {
              status,
              payments: data.charges.map((charge) => {
                return {
                  paymentId: charge.id,
                  nsu: charge.last_transaction?.acquirer_nsu,
                  gatewayStatus: charge.last_transaction.status,
                  amount: charge.last_transaction.amount,
                };
              }),
              orderId: orderId,
              amount: amount,
              description:
                lastTransaction.status === 'failed'
                  ? lastTransaction.gateway_response?.errors[0].message
                  : lastTransaction.acquirer_message,
              returnCode: lastTransaction.acquirer_return_code,
              authorizationCode: lastTransaction.acquirer_auth_code,
            };

            return response;
          } else {
            const revert = data.charges.filter(
              (charge) =>
                charge.status === 'captured' ||
                charge.status === 'paid' ||
                charge.status === 'partial_capture' ||
                charge.status === 'waiting_capture',
            );

            return firstValueFrom(
              forkJoin(
                revert.map((charge) =>
                  this.pagarmeService.cancel(gateway, charge.id),
                ),
              ).pipe(
                map(() => {
                  return {
                    status: PaymentStatus.REFUSED,
                    payments: data.charges.map((charge) => {
                      return {
                        paymentId: charge.id,
                        nsu: charge.last_transaction?.acquirer_nsu,
                        gatewayStatus: charge.last_transaction.status,
                        amount: charge.last_transaction.amount,
                      };
                    }),
                    orderId: orderId,
                    amount: amount,
                    description: 'Error to create the payment',
                    returnCode: revert[0].last_transaction.acquirer_return_code,
                  } as CreditCardPaymentOutputType;
                }),
              ),
            );
          }
        }),
      ),
    );
  }

  private hasSameStatus(status: string[]): boolean {
    const firstStatus = status[0];
    for (let i = 1; i < status.length; i++) {
      if (status[i] !== firstStatus) {
        return false;
      }
    }
    return true;
  }
}

@Injectable()
export class CancelCreditCardPaymentTransactionPagarme extends CancelCreditCardPaymentTransaction {
  constructor(private readonly pagarmeService: PagarmeService) {
    super();
  }

  async execute(
    input: CancelPaymentInputType,
  ): Promise<CancelPaymentOutputType> {
    return await firstValueFrom(
      forkJoin(
        input.payment.transactions.map((transaction) =>
          this.pagarmeService.cancel(input.gateway, transaction.transactionId),
        ),
      ).pipe(
        map((data$) => {
          const data = data$[0];
          const lastTransaction = data.last_transaction;
          const status =
            lastTransaction.status === 'canceled'
              ? PaymentStatus.CANCELED
              : PaymentStatus.REFUSED;

          const response: CancelPaymentOutputType = {
            status,
            amount: data.amount,
            authorizationCode: lastTransaction.acquirer_auth_code,
            description:
              lastTransaction.status === 'failed'
                ? lastTransaction.gateway_response?.errors[0].message
                : lastTransaction.acquirer_message,
            orderId: input.payment.orderId,
            payments: data$.map((charge) => {
              return {
                paymentId: charge.id,
                nsu: charge.last_transaction?.acquirer_nsu,
                gatewayStatus: charge.last_transaction.status,
                amount: charge.last_transaction.amount,
              };
            }),
          };
          return response;
        }),
      ),
    );
  }
}

export const PagarmeCreditCardPaymentProvider: Provider = {
  provide: CreditCardPaymentTransaction,
  useClass: CreateCreditCardTransactionPagarme,
};

export const PagarmeCancelCreditCardPaymentProvider: Provider = {
  provide: CancelCreditCardPaymentTransaction,
  useClass: CancelCreditCardPaymentTransactionPagarme,
};
