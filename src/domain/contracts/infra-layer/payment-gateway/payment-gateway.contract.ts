import { PaymentStatus } from '@/domain/entities/payment';
import { InjectionToken } from '@nestjs/common';

export type PaymentOutputType = {
  payments: {
    paymentId: string;
    nsu?: string;
    amount?: number;
    gatewayStatus?: string;
    description?: string;
  }[];
  description: string;
  orderId: string;
  status: PaymentStatus;
  amount: number;
  returnCode?: string;
  authorizationCode?: string;
};

export interface PaymentTransaction<
  TransactionInput = any,
  TransactionOutput = any,
> {
  execute(input: TransactionInput): Promise<TransactionOutput>;
}

export abstract class PaymentGatewayFactory {
  abstract getPaymentGateway(gatewayName: string): PaymentGatewayContract;
}

export interface PaymentGatewayContract {
  getPaymentTransaction(transactionType: InjectionToken): PaymentTransaction;
}
