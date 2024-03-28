import {
  CancelPaymentInputType,
  CancelPaymentOutputType,
  CancelPixPaymentTransaction,
  PixPaymentInputType,
  PixPaymentOutputType,
  PixPaymentTransaction,
} from '@/domain/contracts/infra-layer/payment-gateway';
import {
  WebhookPaymentTransaction,
  WebhookPaymentTransactionInputType,
  WebhookPaymentTransactionOutputType,
} from '@/domain/contracts/infra-layer/payment-gateway/webhook-transaction.contract';
import { PaymentStatus } from '@/domain/entities';
import { Injectable, Provider } from '@nestjs/common';
import { SantanderUtils } from '@/infrastructure/services/payment-gateway/santander/utils/santander.utils';
import { firstValueFrom, map, mergeMap, from } from 'rxjs';
import { SantanderService } from '@/infrastructure/services/payment-gateway/santander/santander.service';
import moment from 'moment';
import {
  CreatePixRequestInput,
  CreatePixRequestOutput,
  RefoundPixResponse,
  SearchPixResponse,
} from './types';
import { SantanderConstansts } from '@/infrastructure/services/payment-gateway/santander/santander-constants';
import { PaymentByTransactionIdQuery } from '@/application/payment/queries/models/payment-by-transaction-id.query';

@Injectable()
export class PixPaymentWebhookTransactionSantander extends WebhookPaymentTransaction {
  execute(
    input: WebhookPaymentTransactionInputType,
  ): Promise<WebhookPaymentTransactionOutputType> {
    return Promise.resolve({
      paymentStatus: PaymentStatus.APPROVED,
      paymentQuery: new PaymentByTransactionIdQuery(
        input.payload.pix[0].txid,
        input.tenantId,
      ),
    });
  }
}

@Injectable()
export class CreatePixPaymentTransactionSantander extends PixPaymentTransaction {
  constructor(private readonly paymentService: SantanderService) {
    super();
  }

  async execute(input: PixPaymentInputType): Promise<PixPaymentOutputType> {
    const expiracao = this.getExpirationInSeconds(new Date(), input.expiresAt);
    const createPixInput: CreatePixRequestInput = {
      calendario: {
        expiracao,
      },
      valor: {
        original: `${(input.amount / 100).toFixed(2)}`,
      },
      chave: input.gateway?.gatewayConfigs['PIX_KEY'],
      solicitacaoPagador: input.softDescription,
      infoAdicionais: [],
    };

    const txId = SantanderUtils.generateTxId();

    return firstValueFrom(
      this.paymentService
        .createPixCharge(input.gateway, txId, createPixInput)
        .pipe(
          map((data: CreatePixRequestOutput) => {
            const status =
              data.status === 'ATIVA'
                ? PaymentStatus.WAITING
                : PaymentStatus.REFUSED;
            const response: PixPaymentOutputType = {
              status,
              expiresAt: moment(
                data.calendario.criacao,
                SantanderConstansts.DATE_PATTERN,
              ).toDate(),
              paymentId: data.txid,
              qrCode: SantanderUtils.generatePixQrCode({
                merchantName: input.gateway?.gatewayConfigs['MERCHANT_NAME'],
                merchantCity: input.gateway?.gatewayConfigs['MERCHANT_CITY'],
                pixKey: input.gateway?.gatewayConfigs['PIX_KEY'],
                transactionAmount: Number(data.valor.original),
                txid: '***',
              }),
              qrUrl: data.location,
            };
            return response;
          }),
        ),
    );
  }

  private getExpirationInSeconds(startDate: Date, endDate: Date): number {
    const _startDate = moment(startDate).set({
      hour: 0,
      minute: 0,
      second: 0,
    });

    const _endDate = moment(endDate).set({
      hour: 23,
      minute: 59,
      second: 59,
    });

    return _endDate.diff(_startDate, 'seconds');
  }
}

@Injectable()
export class CancelPixPaymentTransactionSantander extends CancelPixPaymentTransaction {
  constructor(private readonly santanderService: SantanderService) {
    super();
  }

  execute(input: CancelPaymentInputType): Promise<CancelPaymentOutputType> {
    return firstValueFrom(
      from(this.santanderService.addTokenHeader()).pipe(
        mergeMap((headers) => {
          return this.santanderService
            .searchPixTransaxtion(
              input.payment.transactions[0].transactionId,
              headers,
            )
            .pipe(
              mergeMap((pixResult: SearchPixResponse) => {
                if (
                  pixResult.status !== 'CONCLUIDA' ||
                  !pixResult.pix ||
                  pixResult.pix.length < 1
                ) {
                  throw new Error(
                    'This request cannot be executed because the pix state is invalid',
                  );
                }

                return this.santanderService.refoundPix(
                  pixResult.pix[0].endToEndId,
                  pixResult.pix[0].valor,
                  input.payment.transactions[0].transactionId,
                  headers,
                );
              }),
              map((refoundResponse: RefoundPixResponse) => {
                let status = null;

                if (refoundResponse.status === 'DEVOLVIDO') {
                  status = PaymentStatus.REFUNDED;
                } else if (refoundResponse.status === 'EM_PROCESSAMENTO') {
                  status = PaymentStatus.WAITING;
                } else {
                  status = PaymentStatus.REFUSED;
                }

                const amount = Number(
                  parseFloat(refoundResponse.valor).toFixed(0),
                );
                const response: CancelPaymentOutputType = {
                  status,
                  amount: amount,
                  description: refoundResponse.motivo,
                  orderId: input.payment.orderId,
                  payments: [
                    {
                      paymentId: refoundResponse.id,
                      gatewayStatus: refoundResponse.status,
                      amount: amount,
                      description: `rtris: ${refoundResponse.rtrId}`,
                    },
                  ],
                };
                return response;
              }),
            );
        }),
      ),
    );
  }
}

export const CancelPixPaymentTransactionSantanderProvider: Provider = {
  provide: CancelPixPaymentTransaction,
  useClass: CancelPixPaymentTransactionSantander,
};

export const CreatePixPaymentSantanderProvider: Provider = {
  provide: PixPaymentTransaction,
  useClass: CreatePixPaymentTransactionSantander,
};

export const WebhookPixPaymentSantanderProvider: Provider = {
  provide: WebhookPaymentTransaction,
  useClass: PixPaymentWebhookTransactionSantander,
};
