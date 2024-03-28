import { BaseEntity } from '@/domain/contracts/infra-layer/repository/base.entity';
import {
  IPayment,
  PaymentSplit,
  PaymentStatus,
  PaymentTransaction,
  PaymentType,
} from '@/domain/entities/payment';
import { UniqueIdentifier } from '@/domain/entities/types';
import { Metadata } from '@/domain/value-objects';
import {
  PaymentCreatedEvent,
  PaymentCanceledEvent,
  PaymentPreApprovedEvent,
  PaymentApprovedEvent,
  PaymentRefusedEvent,
} from '@application/payment/events/models';
import { When } from '@application/_shared/helpers/event-replay.helper';

export class Payment extends BaseEntity implements IPayment {
  constructor(id?: UniqueIdentifier) {
    super(id);
  }

  tenantId: Required<Readonly<string>>;
  buyerId: UniqueIdentifier;
  accountId: string;
  orderId: string;
  type: Required<PaymentType>;
  amount: number;
  status: Required<PaymentStatus>;
  gatewayId: UniqueIdentifier;
  metadata: Metadata;
  expirationAt?: Date;
  transactions?: PaymentTransaction[];
  installments: number;
  split?: PaymentSplit[];

  setTenantId(tenantId: string): IPayment {
    this.tenantId = tenantId;
    return this;
  }

  setBuyerId(buyerId: UniqueIdentifier): IPayment {
    this.buyerId = buyerId;
    return this;
  }

  setAccountId(accountId: string): IPayment {
    this.accountId = accountId;
    return this;
  }

  setOrderId(orderId: string): IPayment {
    this.orderId = orderId;
    return this;
  }
  setType(type: PaymentType): IPayment {
    this.type = type;
    return this;
  }
  setAmount(amount: number): IPayment {
    this.amount = amount;
    return this;
  }
  setStatus(status: PaymentStatus): IPayment {
    this.status = status;
    return this;
  }
  setGatewayId(gatewayId: UniqueIdentifier): IPayment {
    this.gatewayId = gatewayId;
    return this;
  }
  setMetadata(metadata: Metadata): IPayment {
    this.metadata = metadata;
    return this;
  }

  setExpirationAt(expirationAt: Date): IPayment {
    this.expirationAt = expirationAt;
    return this;
  }

  setTransactions(transactions: PaymentTransaction[]) {
    this.transactions = transactions;
    return this;
  }

  setInstallments(installments: number): IPayment {
    this.installments = installments;
    return this;
  }

  setPaymentSplit(split: PaymentSplit[]): IPayment {
    this.split = split;
    return this;
  }

  createPayment(): void {
    this.apply(new PaymentCreatedEvent(this.id, this.toObject()));
  }

  cancelPayment(): void {
    this.apply(new PaymentCanceledEvent(this.id, this.toObject()));
  }

  preApprovePayment(): void {
    this.apply(new PaymentPreApprovedEvent(this.id, this.toObject()));
  }
  approvePayment(): void {
    this.apply(new PaymentApprovedEvent(this.id, this.toObject()));
  }

  refusePayment(): void {
    this.apply(new PaymentRefusedEvent(this.id, this.toObject()));
  }

  toObject(): Partial<IPayment> {
    return {
      id: this.id,
      tenantId: this.tenantId,
      buyerId: this.buyerId,
      accountId: this.accountId,
      orderId: this.orderId,
      type: this.type,
      amount: this.amount,
      metadata: this.metadata,
      status: this.status,
      gatewayId: this.gatewayId,
      transactions: this.transactions,
      installments: this.installments,
      expirationAt: this.expirationAt,
      split: this.split,
    };
  }

  public static copy(payload: IPayment): IPayment {
    return new Payment(payload.id)
      .setTenantId(payload.tenantId)
      .setBuyerId(payload.buyerId)
      .setAccountId(payload.accountId)
      .setType(payload.type)
      .setOrderId(payload.orderId)
      .setGatewayId(payload.gatewayId)
      .setMetadata(payload.metadata)
      .setStatus(payload.status)
      .setAmount(payload.amount)
      .setInstallments(payload.installments)
      .setExpirationAt(payload.expirationAt)
      .setTransactions(payload.transactions)
      .setPaymentSplit(payload.split);
  }

  @When([PaymentCreatedEvent.name])
  public whenCreated(payload: IPayment): void {
    this.setTenantId(payload.tenantId)
      .setBuyerId(payload.buyerId)
      .setAccountId(payload.accountId)
      .setType(payload.type)
      .setOrderId(payload.orderId)
      .setGatewayId(payload.gatewayId)
      .setMetadata(payload.metadata)
      .setStatus(payload.status)
      .setAmount(payload.amount)
      .setInstallments(payload.installments)
      .setExpirationAt(payload.expirationAt)
      .setTransactions(payload.transactions)
      .setPaymentSplit(payload.split);
  }

  @When([
    PaymentCanceledEvent.name,
    PaymentRefusedEvent.name,
    PaymentApprovedEvent.name,
    PaymentPreApprovedEvent.name,
  ])
  public whenCanceled(payload: IPayment): void {
    this.setStatus(payload.status).setTransactions(payload.transactions);
  }
}
