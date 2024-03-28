import { IPayment, PaymentTransaction } from '@/domain/entities';

export class CancelPaymentCommand {
  public payment: IPayment;
  public transactions: PaymentTransaction[];

  constructor(payment: IPayment, transactions: PaymentTransaction[]) {
    this.payment = payment;
    this.transactions = transactions;
  }
}
