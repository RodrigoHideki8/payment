import { IPayment } from '@/domain/entities';

export class RefusePaymentCommand {
  public payment: IPayment;

  constructor(payment: IPayment) {
    this.payment = payment;
  }
}
