import { UseCase } from '@domain/use-cases/use-case';
import { UniqueIdentifier } from '@domain/entities/types';
import { IPayment, PaymentStatus } from '@domain/entities/payment';

export interface GetPaymentInput {
  id: UniqueIdentifier;
  orderId: string;
  accountId: string;
  buyerId: string;
  status: PaymentStatus;
  startDate: Date;
  endDate: Date;
  page: number;
  size: number;
  tenantId: string;
}

export type GetPaymentOutput = IPayment;

export abstract class GetPayment extends UseCase<
  Partial<GetPaymentInput>,
  GetPaymentOutput
> {}
