import {
  CaptureType,
  PaymentSplit,
  PaymentStatus,
  PaymentTransaction,
  PaymentType,
} from '@/domain/entities/payment';
import { UniqueIdentifier } from '@domain/entities/types';
import { Metadata } from '@domain/value-objects';

export class CreatePaymentCommand {
  public readonly buyerId: UniqueIdentifier;
  public readonly metadata: Metadata;
  public readonly orderId: string;
  public readonly accountId: string;
  public readonly amount: number;
  public readonly status: PaymentStatus;
  public readonly gatewayId: UniqueIdentifier;
  public readonly tenantId: string;
  public readonly type: PaymentType;
  public readonly transactions?: PaymentTransaction[];
  public readonly installments?: number;
  public readonly expirationAt?: Date;
  public readonly captureType?: CaptureType;
  public readonly split?: PaymentSplit[];

  constructor(
    tenantId: string,
    buyerId: UniqueIdentifier,
    metadata: Metadata,
    orderId: string,
    accountId: string,
    amount: number,
    gatewayId: UniqueIdentifier,
    type: PaymentType,
    status: PaymentStatus,
    transactions?: PaymentTransaction[],
    installments?: number,
    captureType?: CaptureType,
    split?: PaymentSplit[],
    expirationAt?: Date,
  ) {
    this.tenantId = tenantId;
    this.accountId = accountId;
    this.metadata = metadata;
    this.orderId = orderId;
    this.buyerId = buyerId;
    this.captureType = captureType;
    this.installments = installments;
    this.amount = amount;
    this.gatewayId = gatewayId;
    this.transactions = transactions;
    this.status = status;
    this.type = type;
    this.expirationAt = expirationAt;
    this.split = split;
  }
}
