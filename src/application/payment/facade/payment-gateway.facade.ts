import { Injectable, Provider } from '@nestjs/common';
import { PaymentType } from '@/domain/entities';
import { UniqueIdentifier } from '@/domain/entities/types';
import {
  ChooseGatewayByFee,
  ChooseGatewayByFeeInput,
  ChooseGatewayByFeeOutput,
} from '@/domain/use-cases/gateway/choose-gateway-by-fee';
import { firstValueFrom } from 'rxjs';
import {
  GetGatewayByPlayer,
  GetGatewayByPlayerOutput,
} from '@/domain/use-cases/gateway/get-gateway-by-player';

export abstract class PaymentGatewayFacade {
  abstract choosePaymentGateway(
    tenantId: UniqueIdentifier,
    paymentType: PaymentType,
    amount: number,
    installments?: number,
  ): Promise<ChooseGatewayByFeeOutput>;

  abstract getPaymentGatewayByPlayer(
    tenantId: UniqueIdentifier,
    player: string,
  ): Promise<GetGatewayByPlayerOutput>;
}

@Injectable()
export class PaymentGatewayFacadeImpl implements PaymentGatewayFacade {
  constructor(
    private readonly chooseGatewayUseCase: ChooseGatewayByFee,
    private readonly gatewayByPlayerUseCase: GetGatewayByPlayer,
  ) {}

  async choosePaymentGateway(
    tenantId: UniqueIdentifier,
    paymentType: PaymentType,
    amount: number,
    installments?: number,
  ): Promise<ChooseGatewayByFeeOutput> {
    const input: ChooseGatewayByFeeInput = {
      tenantId: tenantId,
      paymentType: paymentType,
      installments: installments,
      amount: amount,
    };

    const chooseGatewayUseCase$ = this.chooseGatewayUseCase.execute(input);
    return await firstValueFrom(chooseGatewayUseCase$);
  }
  async getPaymentGatewayByPlayer(
    tenantId: UniqueIdentifier,
    player: string,
  ): Promise<GetGatewayByPlayerOutput> {
    const gatewayByPlayer$ = this.gatewayByPlayerUseCase.execute({
      tenantId,
      player,
    });
    return await firstValueFrom(gatewayByPlayer$);
  }
}
export const PaymentGatewayFacadeProvider: Provider = {
  provide: PaymentGatewayFacade,
  useClass: PaymentGatewayFacadeImpl,
};
