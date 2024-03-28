import { PaymentStatus } from '@/domain/entities/payment';
import { UniqueIdentifier } from '@/domain/entities/types';
import { UseCase } from '@domain/use-cases/use-case';

export interface CancelCreditCardPaymentInput {
  aggregateId: UniqueIdentifier;
}

export interface CancelCreditCardPaymentOutput {
  description: string;
  aggregateId: UniqueIdentifier;
  authorizationCode: string;
  amount: number;
  releaseAt: string;
  status: PaymentStatus;
}

export abstract class CancelCreditCardPayment extends UseCase<
  CancelCreditCardPaymentInput,
  CancelCreditCardPaymentOutput
> {}
