import { PaymentStatus } from '@/domain/entities/payment';
import { PaymentTransaction } from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway.contract';
import { IBuyer, IGateway } from '@/domain/entities';
import { Split } from '@/domain/value-objects';

export type PixPaymentInputType = {
  tenantId: string;
  orderNumber: string;
  softDescription: string;
  buyer: IBuyer;
  gateway: IGateway;
  amount: number;
  expiresAt: Date;
  split?: Split[];
};

export type PixPaymentOutputType = {
  paymentId: string;
  status: PaymentStatus;
  qrCode: string;
  qrUrl: string;
  expiresAt: Date;
};

export abstract class PixPaymentTransaction
  implements PaymentTransaction<PixPaymentInputType, PixPaymentOutputType>
{
  abstract execute(input: PixPaymentInputType): Promise<PixPaymentOutputType>;
}
