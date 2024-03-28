import { IPayment, PaymentTransaction } from '@/domain/entities';

export class PreApprovePaymentCommand {
  public payment: IPayment;
  public transactions: PaymentTransaction[];

  constructor(payment: IPayment, transactions: PaymentTransaction[]) {
    this.payment = payment;
    this.transactions = transactions;
  }
}
