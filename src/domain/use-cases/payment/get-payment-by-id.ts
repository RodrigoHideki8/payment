import { UseCase } from '@domain/use-cases/use-case';
import { UniqueIdentifier } from '@domain/entities/types';
import { IPayment } from '@domain/entities/payment';

export interface GetPaymentByIdInput {
  aggregateId: UniqueIdentifier;
}

export type GetPaymentByIdOutput = IPayment;

export abstract class GetPaymentById extends UseCase<
  GetPaymentByIdInput,
  GetPaymentByIdOutput
> {}
