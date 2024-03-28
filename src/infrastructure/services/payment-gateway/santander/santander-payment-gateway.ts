import { Injectable, InjectionToken, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PaymentTransaction } from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway.contract';
import { PaymentGatewayContract } from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway.contract';

@Injectable()
export class SantanderPaymentGateway implements PaymentGatewayContract {
  constructor(private readonly moduleRef: ModuleRef) {}
  getPaymentTransaction(transactionType: InjectionToken): PaymentTransaction {
    return this.moduleRef.get(transactionType);
  }
}

export const SantanderPaymentGatewayProvider: Provider = {
  provide: 'santander',
  useClass: SantanderPaymentGateway,
};
