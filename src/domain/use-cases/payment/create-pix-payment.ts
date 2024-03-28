import { UseCase } from '@domain/use-cases/use-case';
import { UniqueIdentifier } from '@domain/entities/types';
import { PaymentStatus } from '@domain/entities/payment';
import { Metadata, Split } from '@domain/value-objects';

export interface CreatePixPaymentInput {
  tenantId: string;
  amount: number;
  buyerId: UniqueIdentifier;
  accountId: string;
  metadata: Metadata;
  softDescription: string;
  orderId: string;
  expiresAt: Date;
  split?: Split[];
}

export interface CreatePixPaymentOutput {
  aggregateId: UniqueIdentifier;
  status: PaymentStatus;
  orderId: string;
  gatewayId: UniqueIdentifier;
  amount: number;
  expiresAt: Date;
  qrCode: string;
  qrUrl: string;
  transactionId: string;
}

export abstract class CreatePixPayment extends UseCase<
  CreatePixPaymentInput,
  CreatePixPaymentOutput
> {}
