import { DateUtils } from '@/domain/utils/date.utils';
import {
  PagarmeTaxAntecipation,
  PaymentGatewayTaxAntecipationProvider,
} from '@/infrastructure/services/payment-gateway/pagarme/pagarme-tax-antecipation';
import { Test, TestingModule } from '@nestjs/testing';

const ANTICIPATION_FEE = 1.47;
let expectedValue;
let deadline;
let numberOfInstallments;
class MockReceiverInGatewayRepository {
  capture(logger: any) {
    return { subscribe: jest.fn() };
  }
}

jest.mock(
  '@/infrastructure/repositories/mongodb/receiver-in-gateway/receiver-in-gateway.repository',
  () => {
    return {
      ReceiverInGatewayRepositoryImpl: MockReceiverInGatewayRepository,
    };
  },
);

describe('CalculateAdjustedValueService', () => {
  let pagarmeService: PagarmeTaxAntecipation;
  let mockReceiverInGatewayRepository: MockReceiverInGatewayRepository;

  let app: TestingModule;
  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [
        {
          provide: 'RECEIVER_IN_GATEWAY',
          useClass: MockReceiverInGatewayRepository,
        },
        PaymentGatewayTaxAntecipationProvider,
      ],
    }).compile();
    await app.init();
    pagarmeService = app.get('PAYMENT_GATEWAY_TAX_ANTECIPATION');
  });
  it('deve calcular o valor corrigido e chamar receiverInGateway.create', async () => {
    const totalValue = 2745390;
    numberOfInstallments = 12;
    deadline = 2;
    const receiverAccount = {
      accountId: '6525ae550f929c747c73d828',
      amount: 2745390,
    };
    const gatewayId = '131cc40d-fad6-4f2c-bd3a-877a796af97f';
    expectedValue = 3035015;

    const correctedValue = pagarmeService.getAdjustedSplitNetValue(
      totalValue,
      numberOfInstallments,
      ANTICIPATION_FEE,
      deadline,
      receiverAccount,
      gatewayId,
    );

    console.log('Valor Ajustado ' + expectedValue);

    expect(correctedValue).toBeGreaterThanOrEqual(expectedValue - 2);
    expect(correctedValue).toBeLessThanOrEqual(expectedValue + 2);
  });
});

describe('CalculateTaxValue', () => {
  let pagarmeService: PagarmeTaxAntecipation;

  let app: TestingModule;
  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [
        {
          provide: 'RECEIVER_IN_GATEWAY',
          useValue: MockReceiverInGatewayRepository,
        },
        PaymentGatewayTaxAntecipationProvider,
      ],
    }).compile();
    await app.init();

    pagarmeService = await app.get('PAYMENT_GATEWAY_TAX_ANTECIPATION');
  });
  it('deve calcular o valor da taxa para cada parcela', async () => {
    const today = new Date();
    const settlementDate = DateUtils.addBusinessDays(new Date(today), deadline);
    const daysInAdvance = [];
    for (let i = 1; i <= numberOfInstallments; i++) {
      daysInAdvance.push(
        pagarmeService.calculateDaysInAdvance(settlementDate, i, today),
      );
    }
    const installmentValue = expectedValue / numberOfInstallments;

    let i = 1;
    for (const day of daysInAdvance) {
      const netValue = pagarmeService.getInstallmentNetValue(
        installmentValue,
        ANTICIPATION_FEE,
        day,
      );
      console.log(
        `valor da taxa: + ${Math.round(
          installmentValue - netValue,
        )} parcela:   ${i}, dias antecipados: ${day}`,
      );
      i++;
    }
    expect(settlementDate).toEqual(expect.any(Date));
  });
});
