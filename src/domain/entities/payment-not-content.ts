import { IEntity } from './entity';

export interface IPaymentNotContent extends IEntity {
  paymentId: string;
  status: string;
  setPaymentId(paymentId: string): IPaymentNotContent;
  setStatus(status: string): IPaymentNotContent;
  approvePayment(): void;
}
