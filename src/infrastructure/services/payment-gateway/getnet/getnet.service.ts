import { IBuyer, IGateway } from '@/domain/entities';
import {
  Brand,
  CreditCard,
  CreditCardPayment,
  Metadata,
} from '@/domain/value-objects';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import {
  GetnetAddress,
  GetnetAuthTokenResponse,
  GetnetCancelCurrencyPaymentResponse,
  GetnetCancelPaymentRequest,
  GetnetCancelPaymentResponse,
  GetnetCreditCard,
  GetnetCreditCardPaymentErrorResponse,
  GetnetCreditCardPaymentRequest,
  GetnetCreditCardPaymentSuccessResponse,
  GetnetCustomer,
  GetnetDevice,
  GetnetMarketplaceSubsellerPayment,
  GetnetNumberTokenRequest,
  GetnetNumberTokenResponse,
  GetnetOrder,
  GetnetOrderItem,
  GetnetShipping,
} from './types';
import { ConfigService } from '@nestjs/config';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { AxiosError } from 'axios';
import { WinstonAdapter } from '@/infrastructure/services/logger/adapters/winston.adapter';
import { GATEWAY_NAME } from './getnet-payment-gateway';
import { LoggerRepository } from '@/domain/contracts/infra-layer/repository/logger.repository';
import { PaymentGatewayLog } from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway-logger.contract';
import { isTruthy } from '@/domain/utils/string.utils';

@Injectable()
export class GetnetService {
  private static readonly LOGIN_URI =
    '/auth/oauth/v2/token?scope=oob&grant_type=client_credentials';
  private static readonly NUMBER_TOKEN_URI = '/v1/tokens/card';
  private static readonly CREDIT_CARD_URI = '/v1/payments/credit';
  private static readonly CANCEL_CURRENCY_PAYMENT_URI =
    '/v1/payments/credit/%payment_id%/cancel';
  private static readonly CANCEL_PAYMENT_URI = '/v1/payments/cancel/request';

  constructor(
    private readonly httpService: HttpService,
    private readonly loggerService: WinstonAdapter,
    private readonly configService: ConfigService,
    @Inject('PAYMENT_GATEWAY_LOGGER')
    private readonly paymentGatewayLogger: LoggerRepository<PaymentGatewayLog>,
  ) {}

  createCreditCardPayment(
    orderId: string,
    softDescription: string,
    buyer: IBuyer,
    installments: number,
    metadata: Metadata,
    amount: number,
    gateway: IGateway,
    payments: CreditCardPayment[],
  ): Observable<
    | GetnetCreditCardPaymentSuccessResponse
    | GetnetCreditCardPaymentErrorResponse
  > {
    return this.addTokenHeader().pipe(
      switchMap((headers) => {
        return this.generateNumberToken(
          payments[0].creditCard.number,
          buyer.id.toString(),
          headers,
        ).pipe(
          map((numberTokenResponse: GetnetNumberTokenResponse) => {
            const order: GetnetOrder = {
              order_id: orderId,
              product_type: 'service',
            };

            const device: GetnetDevice = {
              device_id: metadata.device ?? buyer.documentValue + buyer.id,
              ip_address: metadata.ipAddress,
            };

            return {
              seller_id: gateway.gatewayConfigs['SELLER_ID'],
              amount: amount,
              currency: 'BRL',
              order: order,
              customer: this.mapCustomer(buyer),
              device: device,
              shippings: [this.mapShippings(buyer)],
              marketplace_subseller_payments: this.mapSplit(
                orderId,
                softDescription,
                amount,
                payments[0],
              ),
              credit: this.mapCreditCard(
                installments,
                softDescription,
                payments[0].creditCard,
                numberTokenResponse.number_token,
              ),
            };
          }),
          switchMap(
            (creditCardPaymentRequest: GetnetCreditCardPaymentRequest) => {
              this.loggerService.debug(
                '[GETNET] Create credit card payment with parameters: ' +
                  JSON.stringify(creditCardPaymentRequest),
              );
              return this.httpService
                .post<GetnetCreditCardPaymentSuccessResponse>(
                  GetnetService.CREDIT_CARD_URI,
                  creditCardPaymentRequest,
                  { headers },
                )
                .pipe(
                  tap((res) => {
                    this.loggerService.debug(
                      '[GETNET] Payment created with gateway response: ' +
                        JSON.stringify(res.data),
                    );
                  }),
                  map((res) => {
                    this.paymentGatewayLogger
                      .capture({
                        tenantId: gateway.tenantId,
                        gatewayId: gateway.id,
                        player: gateway.player,
                        request: creditCardPaymentRequest,
                        response: res.data,
                        statusCode: res.status,
                      })
                      .subscribe();

                    return res.data;
                  }),
                  catchError((err: AxiosError) => {
                    this.paymentGatewayLogger
                      .capture({
                        tenantId: gateway.tenantId,
                        gatewayId: gateway.id,
                        player: gateway.player,
                        request: creditCardPaymentRequest,
                        response: err.response?.data || err.message,
                        statusCode: err.status,
                      })
                      .subscribe();

                    if (
                      err.response &&
                      err.response.data instanceof Object &&
                      'status_code' in err.response.data &&
                      'details' in err.response.data
                    ) {
                      return of(err.response.data as any);
                    }
                    throw Error(JSON.stringify(err.response.data));
                  }),
                );
            },
          ),
        );
      }),
    );
  }

  generateNumberToken(
    creditCardNumber: string,
    customerId: string,
    headers: Record<string, string | number>,
  ): Observable<GetnetNumberTokenResponse> {
    const body: GetnetNumberTokenRequest = {
      card_number: creditCardNumber,
      customer_id: customerId,
    };

    return this.httpService
      .post<GetnetNumberTokenResponse>(GetnetService.NUMBER_TOKEN_URI, body, {
        headers,
      })
      .pipe(
        catchError((err: AxiosError) => {
          this.loggerService.error(JSON.stringify(err.response.data));
          throw Error(JSON.stringify(err.response.data));
        }),
        map((res) => res.data),
      );
  }

  cancelCurrencyPayment(
    paymentId: string,
  ): Observable<GetnetCancelCurrencyPaymentResponse> {
    return this.addTokenHeader().pipe(
      switchMap((headers) => {
        return this.httpService
          .post<GetnetCancelCurrencyPaymentResponse>(
            GetnetService.CANCEL_CURRENCY_PAYMENT_URI.replace(
              '%payment_id%',
              paymentId,
            ),
            {},
            {
              headers,
            },
          )
          .pipe(
            catchError((err: AxiosError) => {
              this.loggerService.error(JSON.stringify(err.response.data));
              throw Error(JSON.stringify(err.response.data));
            }),
            map((res) => res.data),
          );
      }),
    );
  }

  cancelPayment(
    paymentId: string,
    amount: number,
  ): Observable<GetnetCancelPaymentResponse> {
    const body: GetnetCancelPaymentRequest = {
      cancel_amount: amount,
      payment_id: paymentId,
    };
    return this.addTokenHeader().pipe(
      switchMap((headers) => {
        return this.httpService
          .post<GetnetCancelPaymentResponse>(
            GetnetService.CANCEL_PAYMENT_URI,
            body,
            {
              headers,
            },
          )
          .pipe(
            catchError((err: AxiosError) => {
              this.loggerService.error(JSON.stringify(err.response.data));
              throw Error(JSON.stringify(err.response.data));
            }),
            map((res) => res.data),
          );
      }),
    );
  }

  private addTokenHeader(
    headers?: Record<string, string | number>,
  ): Observable<Record<string, string | number>> {
    if (headers == null) headers = {};
    return this.generateAuthTokenHeader().pipe(
      map((tokenOutput) => {
        headers.Authorization = `Bearer ${tokenOutput.access_token}`;
        return headers;
      }),
    );
  }

  private generateAuthTokenHeader(): Observable<GetnetAuthTokenResponse> {
    const token = Buffer.from(
      `${this.configService.get('GETNET_CLIENT_ID')}:${this.configService.get(
        'GETNET_CLIENT_SECRET',
      )}`,
    ).toString('base64');

    return this.httpService
      .post<GetnetAuthTokenResponse>(GetnetService.LOGIN_URI, null, {
        headers: { Authorization: `Basic ${token}` },
      })
      .pipe(
        catchError((err: AxiosError) => {
          this.loggerService.error(JSON.stringify(err.response.data));
          throw Error(JSON.stringify(err.response.data));
        }),
        map((res) => res.data),
      );
  }

  private mapSplit(
    orderId: string,
    softDescription: string,
    amount: number,
    payment: CreditCardPayment,
  ): GetnetMarketplaceSubsellerPayment[] {
    const value = payment.split.filter((split) => isTruthy(split.principal))[0];

    const extInfo = value.externalInfos.filter(
      (info) => info.gateway === GATEWAY_NAME,
    );

    const taxEvermart = amount - value.amount;

    const itemsOrder: GetnetOrderItem = {
      amount: amount,
      currency: 'BRL',
      id: orderId,
      description: softDescription,
      tax_amount: taxEvermart,
    };

    const subSeller = {
      subseller_sales_amount: amount,
      subseller_id: extInfo.length > 0 ? extInfo[0].externalId : undefined,
      order_items: [itemsOrder],
    };

    return [subSeller];
  }

  private mapCreditCard(
    installments: number,
    softDescription: string,
    creditCard: CreditCard,
    numberToken: string,
  ): GetnetCreditCard {
    return {
      delayed: false,
      pre_authorization: false,
      save_card_data: false,
      transaction_type: installments === 1 ? 'FULL' : 'INSTALL_NO_INTEREST',
      number_installments: installments,
      soft_descriptor: softDescription,
      card: {
        number_token: numberToken,
        cardholder_name: creditCard.holder,
        security_code: creditCard.cvv,
        brand: this.mapBrand(creditCard.brand),
        expiration_month: creditCard.expirationMonth,
        expiration_year: creditCard.expirationYear,
      },
    };
  }

  private mapShippings(buyer: IBuyer): GetnetShipping {
    const names = buyer.name.split(' ');

    return {
      first_name: names.shift(),
      name: buyer.name,
      email: buyer.email,
      phone_number: buyer.phoneNumber,
      address: this.mapAddress(buyer),
    };
  }

  private mapCustomer(buyer: IBuyer): GetnetCustomer {
    const names = buyer.name.split(' ');

    return {
      customer_id: buyer.id.toString(),
      first_name: names.shift(),
      last_name: names.pop(),
      name: buyer.name,
      email: buyer.email,
      document_type: buyer.documentType,
      document_number: buyer.documentValue,
      phone_number: buyer.phoneNumber,
      billing_address: this.mapAddress(buyer),
    };
  }

  private mapAddress(buyer: IBuyer): GetnetAddress {
    return {
      street: buyer.address?.address ?? '',
      number: buyer.address?.number ?? '',
      complement: buyer.address?.complement ?? '',
      district: buyer.address?.neighborhood ?? '',
      city: buyer.address?.city ?? '',
      state: buyer.address?.state ?? '',
      country: buyer.address?.country ?? '',
      postal_code: buyer.address?.zipCode ?? '',
    };
  }

  private mapBrand(brand: Brand) {
    if (Brand.MASTERCARD === brand) {
      return 'Mastercard';
    } else if (Brand.VISA === brand) {
      return 'Visa';
    } else if (Brand.AMEX_CREDITO === brand) {
      return 'Amex';
    } else if (Brand.ELO_CREDITO === brand) {
      return 'Elo';
    } else if (Brand.HIPERCARD === brand) {
      return 'Hipercard';
    } else {
      return undefined;
    }
  }
}
