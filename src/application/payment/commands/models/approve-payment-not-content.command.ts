import { IPaymentNotContent, PaymentTransaction } from '@/domain/entities';

export class ApprovePaymentNotContentCommand {
  public payment: IPaymentNotContent;

  constructor(payment: IPaymentNotContent) {
    this.payment = payment;
  }
}
