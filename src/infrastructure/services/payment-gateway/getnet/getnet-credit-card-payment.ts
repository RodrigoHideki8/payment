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
import { firstValueFrom, map } from 'rxjs';
import {
  GetnetCreditCardPaymentErrorResponse,
  GetnetCreditCardPaymentSuccessResponse,
} from './types';
import { GetnetService } from './getnet.service';
import { UnprocessablePaymentError } from '@/application/payment/errors';
import { DateUtils } from '@/domain/utils/date.utils';
import { CreditCardPayment } from '@/domain/value-objects';
import { isTruthy } from '@/domain/utils/string.utils';
import { GATEWAY_NAME } from './getnet-payment-gateway';

@Injectable()
export class CreateCreditCardTransactionGetnet extends CreditCardPaymentTransaction {
  constructor(private readonly getnetService: GetnetService) {
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
      metadata,
      amount,
      gateway,
      payments,
    } = input;

    if (payments.length > 1)
      throw new UnprocessablePaymentError(
        "This gateway doesn't support multiple credit card payment",
      );

    const validExternalGatewayId = this.validateExternalGatewayId(payments);

    if (validExternalGatewayId) {
      return await firstValueFrom(
        this.getnetService
          .createCreditCardPayment(
            orderId,
            softDescription,
            buyer,
            installments,
            metadata,
            amount,
            gateway,
            payments,
          )
          .pipe(
            map(
              (
                response:
                  | GetnetCreditCardPaymentSuccessResponse
                  | GetnetCreditCardPaymentErrorResponse,
              ) => {
                if ('payment_id' in response && 'credit' in response) {
                  return this.mapPaymentSuccessCallback(
                    response as GetnetCreditCardPaymentSuccessResponse,
                  );
                } else {
                  return this.mapPaymentFailureCallback(
                    amount,
                    orderId,
                    response as GetnetCreditCardPaymentErrorResponse,
                  );
                }
              },
            ),
          ),
      );
    }
  }

  private validateExternalGatewayId(payments: CreditCardPayment[]) {
    for (const payment of payments) {
      const value = payment.split.filter((split) =>
        isTruthy(split.principal),
      )[0];

      const extInfo = value.externalInfos.filter(
        (info) => info.gateway === GATEWAY_NAME,
      );

      if (extInfo.length < 1 || !extInfo[0].externalId) {
        return false;
      } else{
        return true;
      }
    }
  }

  private mapPaymentFailureCallback(
    amount: number,
    orderId: string,
    response: GetnetCreditCardPaymentErrorResponse,
  ): CreditCardPaymentOutputType {
    if (response.details && response.details.length > 0) {
      return {
        status: PaymentStatus.REFUSED,
        orderId: orderId,
        payments: [
          {
            paymentId: response.details[0].payment_id,
            amount: amount,
            gatewayStatus: response.details[0].status,
            nsu: response.details[0].terminal_nsu,
            description:
              response.details[0].description_detail ??
              response.details[0].description,
          },
        ],
        description: response.message,
        amount: amount,
      };
    }
    throw new Error(
      `[${response.status_code} - ${response.name}] ${response.message}`,
    );
  }

  private mapPaymentSuccessCallback(
    response: GetnetCreditCardPaymentSuccessResponse,
  ): CreditCardPaymentOutputType {
    let status = null;

    if (
      response.status === 'APPROVED' ||
      response.status === 'AUTHORIZED' ||
      response.status === 'CONFIRMED'
    ) {
      status = PaymentStatus.APPROVED;
    } else if (response.status === 'CANCELED') {
      status = PaymentStatus.CANCELED;
    } else {
      status = PaymentStatus.REFUSED;
    }
    return {
      status: status,
      orderId: response.order_id,
      description: response.credit.reason_message,
      amount: response.amount,
      payments: [
        {
          paymentId: response.payment_id,
          amount: response.amount,
          gatewayStatus: response.status,
          nsu: response.credit.terminal_nsu,
        },
      ],
    };
  }
}

@Injectable()
export class CancelCreditCardPaymentTransactionGetnet extends CancelCreditCardPaymentTransaction {
  constructor(private readonly getnetService: GetnetService) {
    super();
  }

  async execute(
    input: CancelPaymentInputType,
  ): Promise<CancelPaymentOutputType> {
    if (
      DateUtils.isBeforeDay(
        input.payment.createdAt,
        DateUtils.getCurrentDateWithTimeZone(),
      )
    ) {
      return await firstValueFrom(
        this.getnetService
          .cancelPayment(
            input.payment.transactions[0].transactionId,
            input.payment.amount,
          )
          .pipe(
            map((data) => {
              const status =
                data.status === 'ACCEPTED'
                  ? PaymentStatus.CANCELED
                  : PaymentStatus.REFUSED;
              const response: CancelPaymentOutputType = {
                status,
                amount: input.payment.amount,
                description: data.status,
                orderId: input.payment.orderId,
                payments: [{ paymentId: data.payment_id }],
              };
              return response;
            }),
          ),
      );
    } else {
      return await firstValueFrom(
        this.getnetService
          .cancelCurrencyPayment(input.payment.transactions[0].transactionId)
          .pipe(
            map((data) => {
              const status =
                data.status === 'CANCELED'
                  ? PaymentStatus.CANCELED
                  : PaymentStatus.REFUSED;
              const response: CancelPaymentOutputType = {
                status,
                amount: data.amount,
                description: data.credit_cancel?.message,
                orderId: data.order_id,
                payments: [{ paymentId: data.payment_id }],
              };
              return response;
            }),
          ),
      );
    }
  }
}

export const GetnetCreditCardPaymentProvider: Provider = {
  provide: CreditCardPaymentTransaction,
  useClass: CreateCreditCardTransactionGetnet,
};

export const GetnetCancelCreditCardPaymentProvider: Provider = {
  provide: CancelCreditCardPaymentTransaction,
  useClass: CancelCreditCardPaymentTransactionGetnet,
};
