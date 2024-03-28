import {
  CancelPaymentInputType,
  CancelPaymentOutputType,
  CancelPixPaymentTransaction,
  PixPaymentInputType,
  PixPaymentOutputType,
  PixPaymentTransaction,
} from '@/domain/contracts/infra-layer/payment-gateway';
import { PagarmeService } from '@/infrastructure/services/payment-gateway/pagarme/pagarme.service';
import { OrderPagarmeRequest, OrderPagarmeResponse } from './types';
import { firstValueFrom, forkJoin, map } from 'rxjs';
import { PaymentStatus } from '@/domain/entities';
import { Injectable, Provider } from '@nestjs/common';
import { removeSpecialCharacters } from '@/domain/utils/string.utils';

@Injectable()
export class CreatePixPaymentTransactionPagarme extends PixPaymentTransaction {
  constructor(private readonly paymentService: PagarmeService) {
    super();
  }
  async execute(input: PixPaymentInputType): Promise<PixPaymentOutputType> {
    const {
      softDescription,
      buyer,
      amount,
      expiresAt,
      orderNumber,
      gateway,
      split,
    } = input;

    if (!buyer.phoneNumber) {
      throw new Error(
        `Phone number in buyer record [${buyer.id}] is required!`,
      );
    }

    const orderPagarmeRequest: OrderPagarmeRequest =
      this.paymentService.mapToPixOrder(
        removeSpecialCharacters(softDescription),
        buyer,
        amount,
        expiresAt,
        orderNumber,
        gateway,
        split,
      );

    return await firstValueFrom(
      this.paymentService.createOrder(gateway, orderPagarmeRequest).pipe(
        map((data: OrderPagarmeResponse) => {
          const lastTransaction = data.charges[0].last_transaction;
          const status =
            data.charges[0].status === 'pending'
              ? PaymentStatus.WAITING
              : PaymentStatus.REFUSED;
          const response: PixPaymentOutputType = {
            status,
            expiresAt: lastTransaction.expires_at,
            paymentId: data.charges[0].id,
            qrCode: lastTransaction.qr_code,
            qrUrl: lastTransaction.qr_code_url,
          };
          return response;
        }),
      ),
    );
  }
}

@Injectable()
export class CancelPixPaymentTransactionPagarme extends CancelPixPaymentTransaction {
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

export const PagarmeCancelPixPaymentProvider: Provider = {
  provide: CancelPixPaymentTransaction,
  useClass: CancelPixPaymentTransactionPagarme,
};

export const CreatePixPaymentPagarmeProvider: Provider = {
  provide: PixPaymentTransaction,
  useClass: CreatePixPaymentTransactionPagarme,
};
