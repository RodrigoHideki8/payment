import { holidaysForYear } from '@/domain/utils/holiday.utils';
import { ReceiverInGateway } from '@/domain/contracts/infra-layer/payment-gateway';
import { DateUtils } from '@/domain/utils/date.utils';
import { UniqueIdentifier } from '@/domain/entities/types';
import { LoggerRepository } from '@/domain/contracts/infra-layer/repository/logger.repository';
import { Inject, Injectable, Provider } from '@nestjs/common';
import { SplitAccount } from '@/domain/value-objects/split-account';
import {
  PaymentGatewayTaxAntecipationContract,
  PaymentGatewayTaxAntecipationInputType,
  PaymentGatewayTaxAntecipationOutputType,
} from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway-tax-antecipation.contract';

@Injectable()
export class PagarmeTaxAntecipation extends PaymentGatewayTaxAntecipationContract {
  static getAdjustedSplitNetValue(
    totalValue: number,
    numberOfInstallments: any,
    ANTICIPATION_FEE: number,
    deadline: any,
    receiverAccount: { accountId: string; amount: number },
    gatewayId: string,
  ) {
    throw new Error('Method not implemented.');
  }
  execute(
    input: PaymentGatewayTaxAntecipationInputType,
  ): Promise<PaymentGatewayTaxAntecipationOutputType> {
    throw new Error('Method not implemented.');
  }
  constructor(
    @Inject('RECEIVER_IN_GATEWAY')
    private readonly receiverInGatewayRepository: LoggerRepository<ReceiverInGateway>,
  ) {
    super();
  }

  getInstallmentNetValue(
    amount: number,
    antecipationTax: number,
    daysToAntecipate: number,
  ): number {
    const baseAmount = amount;
    return (
      baseAmount -
      (baseAmount * (antecipationTax / 100) * daysToAntecipate) / 30
    );
  }

  private getNetValue(
    amount: number,
    installments: number,
    antecipationTax: number,
    antecipationInDays: Array<number>,
  ): number {
    let totalNetValue = 0;
    const installmentValue = amount / installments;
    for (let i = 1; i <= installments; i++) {
      const netValue = this.getInstallmentNetValue(
        installmentValue,
        antecipationTax,
        antecipationInDays[i - 1],
      );
      totalNetValue += netValue;
    }
    return Math.floor(totalNetValue);
  }

  private checkDatesBetween(
    naturalExpirationDate: Date,
    initialNaturalExpirationDate: Date,
  ) {
    const dates = [];
    const currentDate = new Date(
      naturalExpirationDate.setDate(naturalExpirationDate.getDate() + 1),
    );
    while (currentDate <= initialNaturalExpirationDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const holidaysBetween = dates.filter((date) => {
      const holidays = holidaysForYear(date.getFullYear());
      return holidays.some((holiday) => {
        return (
          holiday.date === date.toISOString().split('T')[0] &&
          date.getDay() >= 1 &&
          date.getDay() <= 5
        );
      });
    });
    return holidaysBetween.length;
  }
  calculateDaysInAdvance(settlementDate: Date, i: number, orderDate: Date) {
    const dateAdjust = [2, 2, 2, 2, 4, 4, 3];
    const countDays = i === 1 ? 29 : 29 + 30 * (i - 1);
    const naturalExpirationDate = DateUtils.addDays(orderDate, countDays);
    let initialNaturalExpirationDate = naturalExpirationDate;
    const getDayNumber = initialNaturalExpirationDate.getDay();
    initialNaturalExpirationDate = DateUtils.addDays(
      initialNaturalExpirationDate,
      dateAdjust[getDayNumber],
    );
    const numberHolidaysBetweenDates = this.checkDatesBetween(
      naturalExpirationDate,
      initialNaturalExpirationDate,
    );
    const finalNaturalExpirationDate = initialNaturalExpirationDate;
    finalNaturalExpirationDate.setDate(
      finalNaturalExpirationDate.getDate() + numberHolidaysBetweenDates,
    );
    const difference = DateUtils.dateDiffInDays(
      settlementDate,
      finalNaturalExpirationDate,
    );
    return difference <= 0 ? 0 : difference;
  }

  getAdjustedSplitNetValue(
    amount: number,
    installments: number,
    antecipationTax: number,
    deadline: number,
    value: SplitAccount,
    gatewayId: UniqueIdentifier,
  ): number {
    const tolerance = 1;
    let adjustedAmount = amount;
    let netValue = 0;
    const antecipationInDays = [];
    const today = new Date();
    const settlementDate = DateUtils.addBusinessDays(new Date(today), deadline);
    if (deadline !== 30 || (deadline === 30 && installments !== 1)) {
      for (let i = 1; i <= installments; i++) {
        antecipationInDays.push(
          this.calculateDaysInAdvance(settlementDate, i, today),
        );
      }
      while (Math.abs(netValue - amount) > tolerance) {
        if (netValue < amount - tolerance) {
          adjustedAmount += 5;
        } else {
          adjustedAmount -= 1;
        }
        netValue = this.getNetValue(
          adjustedAmount,
          installments,
          antecipationTax,
          antecipationInDays,
        );
      }
      this.receiverInGatewayRepository
        .capture({
          accountId: value.accountId,
          adjustedValue: adjustedAmount,
          value: value.amount,
          installments: installments,
          antecipationDays: antecipationInDays,
          taxAntecipation: antecipationTax,
          settlementDate: settlementDate,
          gatewayId: gatewayId,
        })
        .subscribe();
    }
    return adjustedAmount;
  }
}

export const PaymentGatewayTaxAntecipationProvider: Provider = {
  provide: 'PAYMENT_GATEWAY_TAX_ANTECIPATION',
  useClass: PagarmeTaxAntecipation,
};
