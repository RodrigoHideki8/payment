import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  catchError,
  map,
  Observable,
  throwError,
  of,
  switchMap,
  forkJoin,
  from,
} from 'rxjs';
import {
  Billing,
  CardInfo,
  Customer,
  PaymentPayNet,
  PayNetRequest,
  PayNetResponse,
  SellerInfo,
} from '@/infrastructure/services/payment-gateway/paynet/types';
import { PayNetConstanst } from './paynet-constants';
import { CaptureType } from '@/domain/entities/payment';
import {
  CreditCard,
  CreditCardPayment,
} from '@/domain/value-objects/credit-card';
import { Metadata } from '@/domain/value-objects';
import { WinstonAdapter } from '@/infrastructure/services/logger/adapters/winston.adapter';
import {
  CancelPaymentInputType,
  CancelPaymentOutputType,
} from '@/domain/contracts/infra-layer/payment-gateway';
import { IBuyer, IGateway } from '@/domain/entities';
import { UnprocessablePaymentError } from '@/application/payment/errors';

@Injectable()
export class PaynetService {
  private readonly logger = new Logger(PaynetService.name);

  private static readonly NUMBER_TOKEN_URI = '/card';
  private static readonly LOGIN_URI = '/login';
  private static readonly FINANTIAL_URI = '/financial';
  private static readonly CANCEL_URI = '/cancel';
  private static readonly CAPTURE_URI = '/capture';

  constructor(
    private readonly httpService: HttpService,
    private readonly loggerService: WinstonAdapter,
  ) {}

  getAuthorizationCode(): Observable<string> {
    const request = {
      email: process.env.PAYNET_USER,
      password: process.env.PAYNET_PASS,
    };

    return this.httpService.post(PaynetService.LOGIN_URI, request).pipe(
      map((response) => response.data),
      map((data) => data.api_key),
      catchError((error) => {
        this.loggerService.error(error);
        return throwError(
          () =>
            new InternalServerErrorException(
              error,
              'Error to authenticate on paynet gateway',
            ),
        );
      }),
    );
  }

  createCallHeaders(): Observable<any> {
    return this.getAuthorizationCode().pipe(
      map((authCode) => {
        return { headers: { Authorization: authCode } };
      }),
    );
  }

  captureCreditCardTransaction(
    paymentId: string,
    amount: number,
    gateway: IGateway,
  ): Observable<PayNetResponse> {
    this.loggerService.verbose(
      `[PAYNET] capture credit card payment with id ${paymentId} and amount ${amount}`,
    );

    const header$ = this.createCallHeaders();
    const data = {
      documentNumber: gateway.gatewayConfigs['DOCUMENT_EC'],
      paymentId,
      amount,
    };

    return from(header$).pipe(
      switchMap((auth) => {
        return this.httpService
          .post(PaynetService.CAPTURE_URI, data, auth)
          .pipe(
            map((response) => response.data),
            catchError((error) => {
              this.loggerService.error(error);

              return throwError(
                () =>
                  new InternalServerErrorException(
                    JSON.stringify(error?.response?.data || error?.message) ||
                      'Error to capture the payment',
                  ),
              );
            }),
          );
      }),
    );
  }

  createCreditCardNumberToken(
    documentNumber: string,
    cardNumber: string,
    cardHolder: string,
    expirationMonth: string,
    expirationYear: string,
    customerName: string,
  ): Observable<any> {
    this.loggerService.verbose(
      `[PAYNET] Create Credit card number token documentNumber: ${documentNumber} 
        cardNumber: ${cardNumber} 
        cardHolder: ${cardHolder} 
        expirationMonth: ${expirationMonth} 
        expirationYear: ${expirationYear}`,
    );
    const header$ = this.createCallHeaders();
    const data = {
      documentNumber,
      cardNumber,
      cardHolder,
      expirationMonth,
      expirationYear,
      customerName,
    };

    return from(header$).pipe(
      switchMap((auth) => {
        this.loggerService.log(`[PAYNET] create credit card number token...`);

        return this.httpService
          .post(PaynetService.NUMBER_TOKEN_URI, data, auth)
          .pipe(
            map((response) => response.data),
            map((response) => response?.numberToken),
            catchError((error) => {
              this.loggerService.error(error);

              return throwError(() => new InternalServerErrorException(error));
            }),
          );
      }),
    );
  }

  createCreditCardTransaction(
    payments: CreditCardPayment[],
    orderNumber: string,
    softDescription: string,
    buyer: IBuyer,
    captureType: number,
    installments: number,
    amount: number,
    gateway: IGateway,
    metadata?: Metadata,
  ): Observable<PayNetResponse> {
    if (payments.length > 1)
      throw new UnprocessablePaymentError(
        'This gateway does not support muiltiple credit cards payment',
      );

    this.loggerService.verbose(
      `[PAYNET] Create Credit card transaction: ${JSON.stringify(payments[0])} 
        orderNumber: ${orderNumber} 
        buyer: ${JSON.stringify(buyer)} 
        captureType: ${captureType} 
        amount: ${amount} 
        installments: ${installments}`,
    );

    const header$ = this.createCallHeaders();

    const input = this.mapCreditCardTransactionInput(
      payments[0].creditCard,
      orderNumber,
      softDescription,
      buyer,
      captureType,
      installments,
      amount,
      gateway,
      metadata,
    );

    const data$ = of(input).pipe(
      switchMap((request) => {
        return this.createCreditCardNumberToken(
          buyer.documentValue,
          payments[0].creditCard.number,
          payments[0].creditCard.holder,
          payments[0].creditCard.expirationMonth,
          payments[0].creditCard.expirationYear,
          payments[0].creditCard.holder,
        ).pipe(
          map((numberToken) => {
            request.cardInfo.numberToken = numberToken;
            return request;
          }),
        );
      }),
    );

    return forkJoin({ header$, data$ }).pipe(
      switchMap((request) => {
        this.loggerService.log(
          `[PAYNET] create credit card payment with id ${JSON.stringify(
            request.data$,
          )}`,
        );

        return this.httpService
          .post(PaynetService.FINANTIAL_URI, request.data$, request.header$)
          .pipe(
            map((response) => response.data),
            catchError((error) => {
              return throwError(
                () =>
                  new InternalServerErrorException(
                    JSON.stringify(error?.response?.data || error?.message) ||
                      'Error to execute the payment',
                  ),
              );
            }),
          );
      }),
    );
  }

  cancelCreditCardTransaction(
    data: CancelPaymentInputType,
  ): Observable<CancelPaymentOutputType> {
    this.loggerService.verbose(
      `[PAYNET] Cancel credit card transaction: ${JSON.stringify(data)}`,
    );
    const header$ = this.createCallHeaders();

    return forkJoin({ header$ }).pipe(
      switchMap((request) => {
        return this.httpService
          .post(
            PaynetService.CANCEL_URI,
            {
              paymentId: data.payment.transactions[0].transactionId,
              amount: data.payment.transactions[0].amount || 0,
              documentNumber: data.gateway.gatewayConfigs['DOCUMENT_EC'],
            },
            request.header$,
          )
          .pipe(
            map((response) => response.data),
            catchError((error) => {
              return throwError(
                () =>
                  new InternalServerErrorException(
                    JSON.stringify(error?.response?.data || error?.message) ||
                      'Error to execute the payment',
                  ),
              );
            }),
          );
      }),
    );
  }

  mapCreditCardTransactionInput(
    creditCard: CreditCard,
    orderNumber: string,
    softDescription: string,
    buyer: IBuyer,
    captureType: CaptureType,
    installments: number,
    amount: number,
    gateway: IGateway,
    metadata?: Metadata,
  ): PayNetRequest {
    this.loggerService.verbose(
      `[PAYNET] Map credit card transaction input: ${JSON.stringify(
        creditCard,
      )} 
        orderNumber: ${orderNumber} 
        softDescription: ${softDescription} 
        buyer: ${JSON.stringify(buyer)} 
        captureType: ${captureType} 
        amount: ${amount} 
        metadata: ${metadata} 
        installments: ${installments}`,
    );
    const indexOfCaptureType = Object.keys(CaptureType).indexOf(
      String(captureType),
    );

    const valueOfCaptureType = Number(
      Object.values(CaptureType)[indexOfCaptureType],
    );

    const payment: PaymentPayNet = {
      documentNumber: gateway.gatewayConfigs['DOCUMENT_EC'],
      transactionType: PayNetConstanst.TRANSACTION_TYPE,
      amount: amount,
      currencyCode: PayNetConstanst.CURRENCY_CODE,
      productType:
        installments === PayNetConstanst.CREDITO_A_VISTA
          ? PayNetConstanst.CREDITO_A_VISTA
          : PayNetConstanst.CREDITO_PARCELADO_LOJA,
      installments: installments,
      captureType: valueOfCaptureType,
      recurrent: false,
    };

    const cardInfo: CardInfo = {
      cardholderName: creditCard.holder,
      securityCode: creditCard.cvv,
      brand: 1, //creditCard.brand.code, TODO fix
      expirationMonth: creditCard.expirationMonth,
      expirationYear: creditCard.expirationYear,
    };

    const sellerInfo: SellerInfo = {
      orderNumber: orderNumber,
      softDescriptor: softDescription,
    };

    const customer: Customer = {
      documentType:
        buyer.documentType === String(PayNetConstanst.CPF)
          ? PayNetConstanst.CPF
          : PayNetConstanst.CNPJ,
      documentNumberCDH: buyer.documentValue,
      firstName: buyer.name,
      lastName: '',
      email: buyer.email,
      phoneNumber: buyer.phoneNumber?.substring(3),
      address: buyer.address.address,
      complement: buyer.address.complement || '',
      neighborhood: buyer.address.neighborhood,
      city: buyer.address.city,
      state: buyer.address.state,
      zipCode: buyer.address.zipCode,
      birthdate: buyer.birthDate?.toISOString(),
      ipAddress: metadata?.ipAddress || '',
      country: buyer.address.country,
      number: buyer.address.number,
    };

    const billing: Billing = {
      address: buyer.address.address,
      complement: buyer.address.complement || '',
      neighborhood: buyer.address.neighborhood,
      city: buyer.address.city,
      state: buyer.address.state,
      zipCode: buyer.address.zipCode,
      country: buyer.address.country,
      number: buyer.address.number,
    };

    const trancation: PayNetRequest = {
      payment,
      cardInfo,
      sellerInfo,
      customer,
      billing,
    };

    return trancation;
  }
}
