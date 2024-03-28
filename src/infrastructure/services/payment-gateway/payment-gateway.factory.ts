import {
  PaymentGatewayContract,
  PaymentGatewayFactory,
} from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway.contract';
import { Injectable, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class PaymentGatewayFactoryImp implements PaymentGatewayFactory {
  constructor(private readonly moduleRef: ModuleRef) {}

  getPaymentGateway(gatewayName: string): PaymentGatewayContract {
    return this.moduleRef.get(gatewayName, {
      strict: false,
    });
  }
}

export const PaymentGatewayFactoryProvider: Provider = {
  provide: PaymentGatewayFactory,
  useClass: PaymentGatewayFactoryImp,
};
