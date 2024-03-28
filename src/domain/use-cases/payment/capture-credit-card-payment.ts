import { UseCase } from '@domain/use-cases/use-case';
import { UniqueIdentifier } from '@domain/entities/types';
import { PaymentStatus } from '@domain/entities/payment';

export interface CaptureCreditCardPaymentInput {
  tenantId: string;
  aggregateId: UniqueIdentifier;
  amount: number;
}

export interface CaptureCreditCardPaymentOutput {
  aggregateId: UniqueIdentifier;
  status: PaymentStatus;
  orderId: string;
  gatewayId: UniqueIdentifier;
  authorizationCode?: string;
  amount: number;
}

export abstract class CaptureCreditCardPayment extends UseCase<
  CaptureCreditCardPaymentInput,
  CaptureCreditCardPaymentOutput
> {}
