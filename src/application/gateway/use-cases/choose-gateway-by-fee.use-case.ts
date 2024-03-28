import { Observable, from, tap, reduce, mergeMap } from 'rxjs';
import {
  ChooseGatewayByFee,
  ChooseGatewayByFeeInput,
  ChooseGatewayByFeeOutput,
} from '@/domain/use-cases/gateway/choose-gateway-by-fee';
import { QueryBus } from '@nestjs/cqrs';
import { Provider, Injectable } from '@nestjs/common';
import { GatewayByPaymentTypeQuery } from '../queries/models/gateway-by-payment-type.query';
import { DeepPartial } from '@/domain/types/types';
import { IGateway } from '@/domain/entities';
import { GatewayRule, TaxAppliance } from '@/domain/value-objects';

@Injectable()
export class ChooseGatewayByFeeUseCase implements ChooseGatewayByFee {
  constructor(private readonly queryBus: QueryBus) {}

  execute(
    input: ChooseGatewayByFeeInput,
  ): Observable<ChooseGatewayByFeeOutput> {
    const query = new GatewayByPaymentTypeQuery(
      input.tenantId,
      input.paymentType,
    );

    const elegibleGateways$ = this.queryBus.execute(query);

    return from(elegibleGateways$).pipe(
      tap((gateways: DeepPartial<IGateway[]>) => {
        if (!gateways || gateways.length < 1)
          throw new Error('No gateway configured for this request'); //@todo create a domain error
      }),
      mergeMap((gateways: DeepPartial<IGateway[]>) => from(gateways)),
      reduce((gateway: IGateway, currencyGateway: IGateway) => {
        const gatewayRule = gateway.rules.filter(
          (rule) => rule.paymentType === input.paymentType,
        )[0];

        const currencyGatewayRule = currencyGateway.rules.filter(
          (rule) => rule.paymentType === input.paymentType,
        )[0];

        const gatewayTaxValue = this.calculateTax(input.amount, gatewayRule);
        const currencyGatewayRuleTaxValue = this.calculateTax(
          input.amount,
          currencyGatewayRule,
        );

        return gatewayTaxValue < currencyGatewayRuleTaxValue
          ? gateway
          : currencyGateway;
      }),
    );
  }

  private calculateTax(amount: number, rule: GatewayRule): number {
    return rule.gatewayTaxAppliance === TaxAppliance.AMOUNT
      ? rule.gatewayTax
      : (rule.gatewayTax / 100) * amount;
  }
}

export const ChooseGatewayByFeeUseCaseProvider: Provider = {
  provide: ChooseGatewayByFee,
  useClass: ChooseGatewayByFeeUseCase,
};
