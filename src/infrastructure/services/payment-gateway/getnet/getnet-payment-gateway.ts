import {
  PaymentGatewayContract,
  PaymentTransaction,
} from '@/domain/contracts/infra-layer/payment-gateway';
import { Injectable, InjectionToken, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

export const GATEWAY_NAME = 'getnet';

@Injectable()
export class GetnetPaymentGateway implements PaymentGatewayContract {
  constructor(private readonly moduleRef: ModuleRef) {}
  getPaymentTransaction(transactionType: InjectionToken): PaymentTransaction {
    return this.moduleRef.get(transactionType);
  }
}

export const GetnetPaymentGatewayProvider: Provider = {
  provide: GATEWAY_NAME,
  useClass: GetnetPaymentGateway,
};
