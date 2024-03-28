import { Injectable, Provider } from '@nestjs/common';
import {
  CreditCardPaymentInputType,
  CreditCardPaymentOutputType,
  CreditCardPaymentTransaction,
  CancelPaymentInputType,
  CancelPaymentOutputType,
  CancelCreditCardPaymentTransaction,
  CaptureCreditCardPaymentInputType,
  CaptureCreditCardPaymentTransaction,
} from '@/domain/contracts/infra-layer/payment-gateway';
import { PaymentOutputType } from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway.contract';
import { CaptureType, PaymentStatus } from '@/domain/entities';
import { PaynetService } from '@/infrastructure/services/payment-gateway/paynet/paynet.service';
import { firstValueFrom, map } from 'rxjs';

@Injectable()
export class CreateCreditCardTransactionPaynet extends CreditCardPaymentTransaction {
  constructor(private readonly paynetService: PaynetService) {
    super();
  }

  async execute(
    input: CreditCardPaymentInputType,
  ): Promise<CreditCardPaymentOutputType> {
    const {
      orderId,
      softDescription,
      buyer,
      captureType,
      metadata,
      installments,
      amount,
      gateway,
      payments,
    } = input;

    return await firstValueFrom(
      this.paynetService
        .createCreditCardTransaction(
          payments,
          orderId,
          softDescription,
          buyer,
          captureType,
          installments,
          amount,
          gateway,
          metadata,
        )
        .pipe(
          map((data) => {
            const status =
              data.returnCode == '0' || data.returnCode == '00'
                ? String(captureType) ===
                  CaptureType[CaptureType.PRE_AUTORIZACAO]
                  ? PaymentStatus.PRE_APPROVED
                  : PaymentStatus.APPROVED
                : PaymentStatus.REFUSED;
            const response: CreditCardPaymentOutputType = {
              status,
              orderId: data.orderNumber,
              payments: [{ paymentId: data.paymentId }],
              ...data,
            };
            return response;
          }),
        ),
    );
  }
}

@Injectable()
export class CancelCreditCardPaymentTransactionPaynet extends CancelCreditCardPaymentTransaction {
  constructor(private readonly paynetService: PaynetService) {
    super();
  }

  async execute(
    input: CancelPaymentInputType,
  ): Promise<CancelPaymentOutputType> {
    return await firstValueFrom(
      this.paynetService.cancelCreditCardTransaction(input).pipe(
        map((data) => {
          const status =
            data.returnCode == '0' || data.returnCode == '00'
              ? PaymentStatus.CANCELED
              : PaymentStatus.REFUSED;
          const response: CancelPaymentOutputType = {
            status,
            ...data,
          };
          return response;
        }),
      ),
    );
  }
}

@Injectable()
export class CaptureCreditCardPaymentTransactionPaynet extends CaptureCreditCardPaymentTransaction {
  constructor(private readonly paynetService: PaynetService) {
    super();
  }
  async execute(
    input: CaptureCreditCardPaymentInputType,
  ): Promise<PaymentOutputType> {
    return await firstValueFrom(
      this.paynetService
        .captureCreditCardTransaction(
          input.paymentId,
          input.amount,
          input.gateway,
        )
        .pipe(
          map((data) => {
            const status =
              data.returnCode == '0' || data.returnCode == '00'
                ? PaymentStatus.APPROVED
                : PaymentStatus.REFUSED;
            const response: PaymentOutputType = {
              status,
              orderId: data.orderNumber,
              payments: [{ paymentId: data.paymentId }],
              ...data,
            };
            return response;
          }),
        ),
    );
  }
}

export const PaynetCaptureCreditCardPaymentProvider: Provider = {
  provide: CaptureCreditCardPaymentTransaction,
  useClass: CaptureCreditCardPaymentTransactionPaynet,
};

export const PaynetCreditCardPaymentProvider: Provider = {
  provide: CreditCardPaymentTransaction,
  useClass: CreateCreditCardTransactionPaynet,
};

export const PaynetCancelCreditCardPaymentProvider: Provider = {
  provide: CancelCreditCardPaymentTransaction,
  useClass: CancelCreditCardPaymentTransactionPaynet,
};
