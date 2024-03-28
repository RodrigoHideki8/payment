import { PaymentGatewayLog } from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway-logger.contract';
import { LoggerRepository } from '@/domain/contracts/infra-layer/repository/logger.repository';
import { IGateway } from '@/domain/entities';
import { WinstonAdapter } from '@/infrastructure/services/logger/adapters/winston.adapter';
import { SantanderConstansts } from '@/infrastructure/services/payment-gateway/santander/santander-constants';
import {
  SearchPixResponse,
  CreatePixRequestInput,
  CreatePixRequestOutput,
  GenerateTokenRequestOutput,
  RefoundPixResponse,
} from '@/infrastructure/services/payment-gateway/santander/types';
import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';

@Injectable()
export class SantanderService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly loggerService: WinstonAdapter,
    @Inject('PAYMENT_GATEWAY_LOGGER')
    private readonly paymentGatewayLogger: LoggerRepository<PaymentGatewayLog>,
  ) {}

  createPixCharge(
    gateway: IGateway,
    txid: string,
    data: CreatePixRequestInput,
  ): Observable<CreatePixRequestOutput> {
    this.loggerService.log(
      `[SANTANDER] create payment with data: ${JSON.stringify(data)}`,
    );

    return this.addTokenHeader().pipe(
      switchMap((headers) => {
        return this.httpService
          .put(`${SantanderConstansts.RESOURCER_PIX_COB}/${txid}`, data, {
            headers,
          })
          .pipe(
            tap((response) => {
              this.loggerService.debug(JSON.stringify(response.data));
            }),
            map((res) => {
              this.paymentGatewayLogger
                .capture({
                  tenantId: gateway.tenantId,
                  gatewayId: gateway.id,
                  player: gateway.player,
                  request: data,
                  response: res.data,
                  statusCode: res.status,
                })
                .subscribe();

              return res.data;
            }),
            catchError((error) => {
              this.loggerService.error(
                JSON.stringify(error?.response?.data || error?.message),
              );

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
      }),
    );
  }

  searchPixTransaxtion(
    txid: string,
    headers: Record<string, string | number>,
  ): Observable<SearchPixResponse> {
    return this.httpService
      .get(`${SantanderConstansts.RESOURCER_PIX_COB}/${txid}`, headers)
      .pipe(
        catchError((err: AxiosError) => {
          throw Error(JSON.stringify(err.response?.data ?? err?.message));
        }),
        map((res) => res.data),
      );
  }

  refoundPix(
    endToEndId: string,
    amount: string,
    refoundId: string,
    headers: Record<string, string | number>,
  ): Observable<RefoundPixResponse> {
    const uri = `${SantanderConstansts.RESOURCER_PIX_REFOUND.replace(
      '%e2e%',
      endToEndId,
    )}/${refoundId}`;
    return this.httpService.put(uri, { valor: amount }, headers).pipe(
      catchError((err: AxiosError) => {
        throw Error(JSON.stringify(err.response?.data ?? err?.message));
      }),
      map((res) => res.data),
    );
  }

  addTokenHeader(
    headers?: Record<string, string | number>,
  ): Observable<Record<string, string | number>> {
    if (headers == null) headers = {};
    return this.generateTokenHeader().pipe(
      map((tokenOutput) => {
        headers.Authorization = `Bearer ${tokenOutput.access_token}`;
        return headers;
      }),
    );
  }

  generateTokenHeader(): Observable<GenerateTokenRequestOutput> {
    const body = {
      client_id: this.configService.get('SANTANDER_CLIENT_ID'),
      client_secret: this.configService.get('SANTANDER_CLIENT_SECRET'),
    };
    const params = {
      grant_type: this.configService.get('SANTANDER_GRANT_TYPE'),
    };
    return this.httpService
      .post<GenerateTokenRequestOutput>('', body, {
        params,
        baseURL: this.configService.get('SANTANDER_OAUTH_URI'),
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        catchError((err: AxiosError) => {
          throw Error(JSON.stringify(err.response?.data ?? err?.message));
        }),
        map((res) => res.data),
      );
  }
}
