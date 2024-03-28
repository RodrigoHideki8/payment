import {
  CaptureType,
  IPayment,
  PaymentStatus,
} from '@/domain/entities/payment';
import { Metadata, CreditCardPayment } from '@/domain/value-objects';
import {
  PaymentOutputType,
  PaymentTransaction,
} from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway.contract';
import { IBuyer, IGateway } from '@/domain/entities';

export type CreditCardPaymentInputType = {
  orderId: string;
  softDescription: string;
  buyer: IBuyer;
  captureType: CaptureType;
  metadata: Metadata;
  installments: number;
  amount: number;
  gateway: IGateway;
  payments: CreditCardPayment[];
};

export type CreditCardPaymentOutputType = PaymentOutputType;

export abstract class CreditCardPaymentTransaction
  implements
    PaymentTransaction<CreditCardPaymentInputType, CreditCardPaymentOutputType>
{
  abstract execute(
    input: CreditCardPaymentInputType,
  ): Promise<CreditCardPaymentOutputType>;
}

export type CaptureCreditCardPaymentInputType = {
  paymentId: string;
  amount: number;
  gateway: IGateway;
};

export type CaptureCreditCardPaymentOutputType = PaymentOutputType;

export abstract class CaptureCreditCardPaymentTransaction
  implements
    PaymentTransaction<
      CaptureCreditCardPaymentInputType,
      CaptureCreditCardPaymentOutputType
    >
{
  abstract execute(
    input: CaptureCreditCardPaymentInputType,
  ): Promise<CaptureCreditCardPaymentOutputType>;
}

export type CancelPaymentInputType = {
  payment: IPayment;
  gateway: IGateway;
};

export type CancelPaymentOutputType = PaymentOutputType & {
  releaseAt?: string;
};

export abstract class CancelCreditCardPaymentTransaction
  implements
    PaymentTransaction<CancelPaymentInputType, CancelPaymentOutputType>
{
  abstract execute(
    input: CancelPaymentInputType,
  ): Promise<CancelPaymentOutputType>;
}

export abstract class CancelPixPaymentTransaction
  implements
    PaymentTransaction<CancelPaymentInputType, CancelPaymentOutputType>
{
  abstract execute(
    input: CancelPaymentInputType,
  ): Promise<CancelPaymentOutputType>;
}
