import { PaymentStatus } from '@/domain/entities/payment';
import { UniqueIdentifier } from '@domain/entities/types';

export class PaymentQuery {
  public readonly orderId?: string;
  public readonly id?: UniqueIdentifier;
  public readonly accountId?: string;
  public readonly buyerId?: string;
  public readonly status?: PaymentStatus;
  public readonly startDate?: Date;
  public readonly endDate?: Date;
  public readonly page?: number;
  public readonly size?: number;
  public readonly tenantId?: string;

  constructor(
    id?: UniqueIdentifier,
    orderId?: string,
    accountId?: string,
    buyerId?: string,
    status?: PaymentStatus,
    startDate?: Date,
    endDate?: Date,
    page?: number,
    size?: number,
    tenantId?: string,
  ) {
    this.id = id;
    this.orderId = orderId;
    this.accountId = accountId;
    this.buyerId = buyerId;
    this.status = status;
    this.startDate = startDate;
    this.endDate = endDate;
    this.page = page;
    this.size = size;
    this.tenantId = tenantId;
  }
}
