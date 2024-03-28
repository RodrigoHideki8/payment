import { UniqueIdentifier } from '@/domain/entities/types';
import { UseCase } from '../use-case';
import { PaymentStatus } from '@/domain/entities';

export type CancelPixPaymentInput = {
  aggregateId: UniqueIdentifier;
};

export type CancelPixPaymentOutput = {
  description: string;
  aggregateId: UniqueIdentifier;
  status: PaymentStatus;
};

export abstract class CancelPixPayment extends UseCase<
  CancelPixPaymentInput,
  CancelPixPaymentOutput
> {}
