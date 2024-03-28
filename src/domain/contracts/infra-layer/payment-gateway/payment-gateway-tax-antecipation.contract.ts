import { SplitAccount } from '@/domain/value-objects/split-account';
import { UniqueIdentifier } from '@/domain/entities/types';

export type PaymentGatewayTaxAntecipationInputType = {
  amount: number;
  installments: number;
  antecipationTax: number;
  deadline: number;
  value: SplitAccount;
  gatewayId: UniqueIdentifier;
};

export type PaymentGatewayTaxAntecipationOutputType = {
  adjustedAmount: number;
};

export abstract class PaymentGatewayTaxAntecipationContract {
  getAdjustedSplitNetValue(
    amount: number,
    installments: number,
    ANTECIPATION_TAX: number,
    accountDeadLine: number,
    receiverAccount: SplitAccount,
    gatewayId: UniqueIdentifier,
  ): any {
    throw new Error('Method not implemented.');
  }
  abstract: any;
}
