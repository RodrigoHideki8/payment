import { UseCase } from '@domain/use-cases/use-case';
import { UniqueIdentifier } from '@domain/entities/types';
import {
  CaptureType,
  PaymentStatus,
  PaymentTransaction,
} from '@domain/entities/payment';
import { Metadata, CreditCardPayment } from '@domain/value-objects';

export interface CreateCreditCardPaymentInput {
  tenantId: string;
  installments: number;
  amount: number;
  buyerId: UniqueIdentifier;
  metadata: Metadata;
  softDescription: string;
  orderId: string;
  accountId: string;
  captureType: CaptureType;
  payments: CreditCardPayment[];
}

export interface CreateCreditCardPaymentOutput {
  aggregateId: UniqueIdentifier;
  status: PaymentStatus;
  orderId: UniqueIdentifier;
  gatewayId: UniqueIdentifier;
  transactions?: PaymentTransaction[];
  description?: string;
  amount: number;
}

export abstract class CreateCreditCardPayment extends UseCase<
  CreateCreditCardPaymentInput,
  CreateCreditCardPaymentOutput
> {}
