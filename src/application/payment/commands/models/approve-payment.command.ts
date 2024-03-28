import { IPayment, PaymentTransaction } from '@/domain/entities';

export class ApprovePaymentCommand {
  public payment: IPayment;
  public transactions: PaymentTransaction[];

  constructor(payment: IPayment, transactions: PaymentTransaction[]) {
    (this.payment = payment), (this.transactions = transactions);
  }
}
