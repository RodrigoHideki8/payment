import { PaymentType } from '@/domain/entities';
import { UniqueIdentifier } from '@/domain/entities/types';

export class GatewayByPaymentTypeQuery {
  public readonly tenantId: UniqueIdentifier;
  public readonly paymentType: PaymentType;

  constructor(tenantId: UniqueIdentifier, paymentType: PaymentType) {
    this.tenantId = tenantId;
    this.paymentType = paymentType;
  }
}
