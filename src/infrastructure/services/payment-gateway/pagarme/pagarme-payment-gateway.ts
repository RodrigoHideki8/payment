import {
  PaymentGatewayContract,
  PaymentTransaction,
} from '@/domain/contracts/infra-layer/payment-gateway';
import { Injectable, InjectionToken, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

export const GATEWAY_NAME = 'pagar-me';

@Injectable()
export class PagarmePaymentGateway implements PaymentGatewayContract {
  constructor(private readonly moduleRef: ModuleRef) {}
  getPaymentTransaction(transactionType: InjectionToken): PaymentTransaction {
    return this.moduleRef.get(transactionType);
  }
}

export const PagarmePaymentGatewayProvider: Provider = {
  provide: GATEWAY_NAME,
  useClass: PagarmePaymentGateway,
};
