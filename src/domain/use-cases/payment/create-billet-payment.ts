import { UseCase } from '@domain/use-cases/use-case';
import { UniqueIdentifier } from '@domain/entities/types';
import { PaymentStatus } from '@domain/entities/payment';
import { Metadata, Split } from '@domain/value-objects';

export interface CreateBilletPaymentInput {
  tenantId: string;
  amount: number;
  buyerId: UniqueIdentifier;
  metadata: Metadata;
  softDescription: string;
  orderId: string;
  accountId: string;
  expiresAt: Date;
  split?: Split[];
}

export interface CreateBilletPaymentOutput {
  aggregateId: UniqueIdentifier;
  status: PaymentStatus;
  orderId: UniqueIdentifier;
  gatewayId: UniqueIdentifier;
  amount: number;
  expiresAt: Date;
  qrCode: string;
  pdfUrl: string;
  ourNumber: string;
  transactionId: string;
}

export abstract class CreateBilletPayment extends UseCase<
  CreateBilletPaymentInput,
  CreateBilletPaymentOutput
> {}
