import { BaseEntity } from '@/domain/contracts/infra-layer/repository/base.entity';
import { IPaymentNotContent } from '@/domain/entities';
import { PaymentApprovedNotContentEvent } from './events/models/payment-approved-not-content.event';

export class PaymentNotContent
  extends BaseEntity
  implements IPaymentNotContent
{
  toObject(): Partial<IPaymentNotContent> {
    return {
      paymentId: this.paymentId,
      status: this.status,
    };
  }
  status: string;
  paymentId: string;
  setPaymentId(paymentId: string): IPaymentNotContent {
    this.paymentId = paymentId;
    return this;
  }
  setStatus(status: string): IPaymentNotContent {
    this.status = status;
    return this;
  }

  approvePayment(): void {
    this.apply(new PaymentApprovedNotContentEvent(this.id, this.toObject()));
  }
  public static copy(payload: IPaymentNotContent): IPaymentNotContent {
    return new PaymentNotContent()
      .setPaymentId(payload.paymentId)
      .setStatus(payload.status);
  }
}
