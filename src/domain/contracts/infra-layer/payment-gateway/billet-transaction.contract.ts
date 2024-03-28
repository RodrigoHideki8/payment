import { PaymentStatus } from '@/domain/entities/payment';
import { PaymentTransaction } from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway.contract';
import { IBuyer, IGateway } from '@/domain/entities';
import { Split } from '@/domain/value-objects';

export type BilletPaymentInputType = {
  orderNumber: string;
  softDescription: string;
  buyer: IBuyer;
  amount: number;
  expiresAt: Date;
  gateway: IGateway;
  split?: Split[];
};

export type BilletPaymentOutputType = {
  paymentId: string;
  status: PaymentStatus;
  barCode: string;
  pdfUrl: string;
  expiresAt: Date;
  ourNumber?: string;
  qrCode?: string;
};

export abstract class BilletPaymentTransaction
  implements
    PaymentTransaction<BilletPaymentInputType, BilletPaymentOutputType>
{
  abstract execute(
    input: BilletPaymentInputType,
  ): Promise<BilletPaymentOutputType>;
}
