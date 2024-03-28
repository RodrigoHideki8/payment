import { IEntity } from '@domain/entities/entity';
import { UniqueIdentifier } from '@domain/entities/types';
import { Metadata, Split } from '@domain/value-objects';

export enum PaymentType {
  CREDIT_CARD = 'CREDIT_CARD',
  BILLET = 'BILLET',
  PIX = 'PIX',
}

export enum CaptureType {
  AUTORIZACAO = 1,
  PRE_AUTORIZACAO = 2,
}

export enum PaymentStatus {
  CREATED = 'created',
  PRE_APPROVED = 'pre_approved',
  APPROVED = 'approved',
  REFUSED = 'refused',
  REFUNDED = 'refunded',
  OVERDUE = 'overdue',
  CANCELED = 'canceled',
  CHARGEBACK = 'chargeback',
  WAITING = 'waiting',
}

export interface PaymentTransaction {
  transactionId: string;
  nsu?: string;
  gatewayStatus?: string;
  amount?: number;
  description?: string;
}

export interface PaymentSplit {
  amount: number;
  split: Split[];
}

export interface IPayment extends IEntity {
  tenantId: Required<Readonly<string>>;
  buyerId: UniqueIdentifier;
  accountId: string;
  orderId: string;
  type: Required<PaymentType>;
  amount: Required<number>;
  status: Required<PaymentStatus>;
  gatewayId: UniqueIdentifier;
  metadata: Metadata;
  installments: number;
  expirationAt?: Date;
  transactions?: PaymentTransaction[];
  split?: PaymentSplit[];

  setTenantId(tenantId: string): IPayment;
  setBuyerId(buyerId: UniqueIdentifier): IPayment;
  setAccountId(accountId: string): IPayment;
  setOrderId(orderId: string): IPayment;
  setType(type: PaymentType): IPayment;
  setAmount(amount: number): IPayment;
  setStatus(status: PaymentStatus): IPayment;
  setGatewayId(gatewayId: UniqueIdentifier): IPayment;
  setExpirationAt(expirationAt: Date): IPayment;
  setMetadata(metadata: Metadata): IPayment;
  setTransactions(transactions: PaymentTransaction[]): IPayment;
  setInstallments(installments: number): IPayment;
  setPaymentSplit(split: PaymentSplit[]): IPayment;

  createPayment(): void;
  preApprovePayment(): void;
  approvePayment(): void;
  refusePayment(): void;
  cancelPayment(): void;
}
