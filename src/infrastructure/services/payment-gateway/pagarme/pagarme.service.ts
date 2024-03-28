import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { catchError, map, Observable, throwError } from 'rxjs';
import { WinstonAdapter } from '@/infrastructure/services/logger/adapters/winston.adapter';
import { PagarmeConstanst } from './pagarme-constants';
import {
  AddressPagarme,
  ChargePagarmeResponse,
  CustomerPagarme,
  HomePhonePagarme,
  ItemPagarme,
  OrderPagarmeRequest,
  OrderPagarmeResponse,
  PaymentPagarme,
  PaymentSplitPagarme,
  PhonePagarme,
} from './types';
import { IBuyer, IGateway, PaymentType } from '@/domain/entities';
import { CreditCardPayment, Split } from '@/domain/value-objects';
import { GATEWAY_NAME } from './pagarme-payment-gateway';
import { LoggerRepository } from '@/domain/contracts/infra-layer/repository/logger.repository';
import { PaymentGatewayLog } from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway-logger.contract';
import { SplitAccount } from '@/domain/value-objects/split-account';
import { PaymentGatewayTaxAntecipationContract } from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway-tax-antecipation.contract';
@Injectable()
export class PagarmeService {
  private static readonly ORDERS_URI = '/orders';
  private static readonly CHARGES_URI = '/charges';

  constructor(
    private readonly httpService: HttpService,
    private readonly loggerService: WinstonAdapter,
    @Inject('PAYMENT_GATEWAY_LOGGER')
    private readonly paymentGatewayLogger: LoggerRepository<PaymentGatewayLog>,
    @Inject('PAYMENT_GATEWAY_TAX_ANTECIPATION')
    private readonly paymentGatewayTaxAntecipation: PaymentGatewayTaxAntecipationContract,
  ) {}

  createOrder(
    gateway: IGateway,
    data: OrderPagarmeRequest,
  ): Observable<OrderPagarmeResponse> {
    this.loggerService.log(
      `[PAGARME] create payment with data: ${JSON.stringify(data)}`,
    );

    return this.httpService.post(PagarmeService.ORDERS_URI, data).pipe(
      map((response) => {
        this.paymentGatewayLogger
          .capture({
            tenantId: gateway.tenantId,
            gatewayId: gateway.id,
            player: gateway.player,
            request: data,
            response: response.data,
            statusCode: response.status,
          })
          .subscribe();

        return response.data;
      }),
      catchError((error) => {
        this.loggerService.error(error);

        this.paymentGatewayLogger
          .capture({
            tenantId: gateway.tenantId,
            gatewayId: gateway.id,
            player: gateway.player,
            request: data,
            response: error.response?.data || error.message,
            statusCode: error.status,
          })
          .subscribe();

        return throwError(
          () =>
            new InternalServerErrorException(
              JSON.stringify(error?.response?.data || error?.message) ||
                'Error to execute the payment',
            ),
        );
      }),
    );
  }

  cancel(
    gateway: IGateway,
    chargeId: string,
    amount?: number,
  ): Observable<ChargePagarmeResponse> {
    this.loggerService.log(`[PAGARME] cancel payment with id: ${chargeId}`);

    return this.httpService
      .delete(`${PagarmeService.CHARGES_URI}/${chargeId}`)
      .pipe(
        map((response) => {
          this.paymentGatewayLogger
            .capture({
              tenantId: gateway.tenantId,
              gatewayId: gateway.id,
              player: gateway.player,
              request: {
                delete: `${PagarmeService.CHARGES_URI}/${chargeId}`,
              },
              response: response.data,
              statusCode: response.status,
            })
            .subscribe();

          return response.data;
        }),
        catchError((error) => {
          this.loggerService.error(error);

          this.paymentGatewayLogger
            .capture({
              tenantId: gateway.tenantId,
              gatewayId: gateway.id,
              player: gateway.player,
              request: {
                delete: `${PagarmeService.CHARGES_URI}/${chargeId}`,
              },
              response: error.response?.data || error.message,
              statusCode: error.status,
            })
            .subscribe();

          return throwError(
            () =>
              new InternalServerErrorException(
                JSON.stringify(error?.response?.data || error?.message) ||
                  'Error to execute the payment',
              ),
          );
        }),
      );
  }

  mapToCreditCard(
    orderId: string,
    softDescription: string,
    buyer: IBuyer,
    installments: number,
    amount: number,
    gateway: IGateway,
    creaditCardPayments: CreditCardPayment[],
  ): OrderPagarmeRequest {
    const item: ItemPagarme = {
      amount: amount,
      description: softDescription,
      quantity: 1,
      code: orderId,
    };

    const customer: CustomerPagarme = {
      document: buyer.documentValue,
      document_type:
        buyer.documentValue.length === 11
          ? 'CPF'
          : buyer.documentValue.length === 14
          ? 'CNPJ'
          : 'PASSPORT',
      email: buyer.email,
      name: buyer.name,
      type:
        'CPF' === buyer.documentType
          ? PagarmeConstanst.CUSTOMER_TYPE_INDIVIDUAL
          : PagarmeConstanst.CUSTOMER_TYPE_COMPANY,
    };

    if (
      buyer.documentType === 'others' &&
      buyer.documentValue.length !== 11 &&
      buyer.documentValue.length !== 14
    ) {
      customer.address = {
        line_1: 'Madame Toussauds 1',
        country: 'US',
        zip_code: '81641',
        city: 'MEEKER',
        state: 'CO'
      }
    }
    if (buyer.phoneNumber) {
      const homePhone: HomePhonePagarme = {
        home_phone: this.parsePhone(buyer.phoneNumber),
      };

      customer.phones = homePhone;
    }

    const payments: PaymentPagarme[] = [];

    for (const creditCardPayment of creaditCardPayments) {
      const payment: PaymentPagarme = {
        payment_method: PagarmeConstanst.PAYMENT_TYPE_CREADIT_CARD,
        amount: creditCardPayment.amount,
        credit_card: {
          operation_type: PagarmeConstanst.PAYMENT_TYPE_OPERATION,
          card: {
            number: creditCardPayment.creditCard.number,
            holder_name: creditCardPayment.creditCard.holder,
            exp_month: creditCardPayment.creditCard.expirationMonth,
            exp_year: creditCardPayment.creditCard.expirationYear,
            cvv: creditCardPayment.creditCard.cvv,
            billing_address: buyer.address
              ? this.mapAddress(buyer)
              : {
                  line_1: 'R TUIM, 18',
                  zip_code: '04514-100',
                  city: 'São Paulo',
                  state: 'SP',
                  country: 'BR',
                },
          },
          installments: installments,
          statement_descriptor: softDescription,
        },
      };

      if (creditCardPayment.split && creditCardPayment.split.length > 0) {
        payment.split = this.mapToSplit(
          creditCardPayment.amount,
          creditCardPayment.split,
          gateway,
          PaymentType.CREDIT_CARD,
          installments,
        );
      }

      payments.push(payment);
    }

    const orderPagarmeRequest: OrderPagarmeRequest = {
      items: [item],
      customer: customer,
      payments: payments,
    };

    return orderPagarmeRequest;
  }

  mapToPixOrder(
    softDescription: string,
    buyer: IBuyer,
    amount: number,
    expiresAt: Date,
    orderId: string,
    gateway: IGateway,
    split?: Split[],
  ): OrderPagarmeRequest {
    const item: ItemPagarme = {
      amount: amount,
      description: softDescription,
      quantity: 1,
      code: orderId,
    };

    const homePhone: HomePhonePagarme = {
      home_phone: this.parsePhone(buyer.phoneNumber),
    };

    const customer: CustomerPagarme = {
      document: buyer.documentValue,
      email: buyer.email,
      name: buyer.name,
      phones: homePhone,
      type:
        'CPF' === buyer.documentType
          ? PagarmeConstanst.CUSTOMER_TYPE_INDIVIDUAL
          : PagarmeConstanst.CUSTOMER_TYPE_COMPANY,
    };

    const payment: PaymentPagarme = {
      payment_method: PagarmeConstanst.PAYMENT_TYPE_PIX,
      pix: {
        expires_at: expiresAt,
        additional_information: [
          {
            name: softDescription,
            value: `${amount}`,
          },
        ],
      },
      split: this.mapToSplit(amount, split, gateway, PaymentType.PIX),
    };

    const orderPagarmeRequest: OrderPagarmeRequest = {
      items: [item],
      customer: customer,
      payments: [payment],
    };
    return orderPagarmeRequest;
  }

  mapToBilletOrder(
    softDescription: string,
    buyer: IBuyer,
    amount: number,
    orderNumber: string,
    expiresAt: Date,
    gateway: IGateway,
    split?: Split[],
  ): OrderPagarmeRequest {
    const item: ItemPagarme = {
      amount: amount,
      description: softDescription,
      quantity: 1,
      code: orderNumber,
    };

    const customer: CustomerPagarme = {
      document: buyer.documentValue,
      document_type: buyer.documentType,
      email: buyer.email,
      name: buyer.name,
      type:
        'CPF' === buyer.documentType
          ? PagarmeConstanst.CUSTOMER_TYPE_INDIVIDUAL
          : PagarmeConstanst.CUSTOMER_TYPE_COMPANY,
    };

    const payment: PaymentPagarme = {
      payment_method: PagarmeConstanst.PAYMENT_TYPE_BOLETO,
      boleto: {
        instructions: 'Pagar até o vencimento',
        due_at: expiresAt,
        document_number: buyer.documentValue,
        type: 'DM',
      },
      split: this.mapToSplit(amount, split, gateway, PaymentType.BILLET),
    };

    const orderPagarmeRequest: OrderPagarmeRequest = {
      items: [item],
      customer: customer,
      payments: [payment],
    };
    return orderPagarmeRequest;
  }

  private mapAddress(buyer: IBuyer): AddressPagarme {
    return {
      line_1: buyer.address.address,
      line_2: buyer.address.complement,
      zip_code: buyer.address.zipCode,
      city: buyer.address.city,
      state: buyer.address.state,
      country: 'BR',
    };
  }

  private parsePhone(phoneNumber: string): PhonePagarme {
    const phoneNumberRegex = /^(\+\d+|\d+)(\d{2})(\d{9})$/;
    const match = phoneNumber.match(phoneNumberRegex);

    if (!match) return undefined;

    return {
      area_code: match[2] || '',
      country_code: match[1] ? match[1].replace('+', '') : '55',
      number: match[3],
    };
  }

  private processSplit(
    split: Split[],
    installments: number,
    totalAmount: number,
    gateway: IGateway,
    paymentType: PaymentType,
  ) {
    let pagarmeSplit = split.map((value) => {
      const extInfo = value.externalInfos.filter(
        (info: { gateway: string }) => info.gateway === GATEWAY_NAME,
      );
      const gatewayId = gateway.id;
      const receiverAccount: SplitAccount = {
        accountId: value.accountId,
        amount: value.amount,
      };
      value.accountDeadLine =
        value.accountDeadLine === 14 ? 15 : value.accountDeadLine;
      return {
        options: {
          charge_processing_fee: false,
          charge_remainder_fee: false,
          liable: true,
        },
        amount:
          paymentType === 'CREDIT_CARD'
            ? this.paymentGatewayTaxAntecipation.getAdjustedSplitNetValue(
                value.amount,
                installments,
                PagarmeConstanst.ANTECIPATION_TAX,
                value.accountDeadLine,
                receiverAccount,
                gatewayId,
              )
            : value.amount,
        recipient_id: extInfo.length > 0 ? extInfo[0].externalId : undefined,
        type: 'flat',
      };
    });

    const difference = Math.round(
      totalAmount - pagarmeSplit.reduce((acc, cur) => acc + cur.amount, 0),
    );

    if (difference < 0) {
      this.paymentGatewayLogger
        .capture({
          tenantId: gateway.tenantId,
          gatewayId: gateway.id,
          player: gateway.player,
          request: {
            data: {
              totalAmount,
              pagarmeSplit,
            },
          },
          response: { error: 'Split difference is less than zero' },
          statusCode: 400,
        })
        .subscribe();
      pagarmeSplit = split.map((value) => {
        const extInfo = value.externalInfos.filter(
          (info) => info.gateway === GATEWAY_NAME,
        );
        return {
          options: {
            charge_processing_fee: false,
            charge_remainder_fee: false,
            liable: true,
          },
          amount: value.amount,
          recipient_id: extInfo.length > 0 ? extInfo[0].externalId : undefined,
          type: 'flat',
        };
      });
    }
    return pagarmeSplit;
  }
  private mapToSplit(
    totalAmount: number,
    split: Split[],
    gateway: IGateway,
    paymentType?: PaymentType,
    installments?: number,
  ): PaymentSplitPagarme[] {
    if (!split || split.length < 1) return [];

    const pagarmeSplit: PaymentSplitPagarme[] = this.processSplit(
      split,
      installments,
      totalAmount,
      gateway,
      paymentType,
    );
    const difference = Math.round(
      totalAmount - pagarmeSplit.reduce((acc, cur) => acc + cur.amount, 0),
    );

    const recipientId = gateway.gatewayConfigs['SELLER_ID'];
    const pixRecipientId = gateway.gatewayConfigs['PIX_SELLER_ID'];

    pagarmeSplit.push({
      options: {
        charge_processing_fee: true,
        charge_remainder_fee: true,
        liable: true,
      },
      amount: difference,
      recipient_id:
        (paymentType === PaymentType.PIX ||
          paymentType === PaymentType.BILLET) &&
        pixRecipientId
          ? pixRecipientId
          : recipientId,
      type: 'flat',
    });

    return pagarmeSplit;
  }
}
