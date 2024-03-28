import { GatewayByIdQuery } from '@/application/gateway/queries/models/gateway-by-id.query';
import { PaymentGatewayFactory } from '@/domain/contracts/infra-layer/payment-gateway';
import {
  WebhookPaymentTransaction,
  WebhookPaymentTransactionOutputType,
} from '@/domain/contracts/infra-layer/payment-gateway/webhook-transaction.contract';
import {
  IGateway,
  IPayment,
  IPaymentNotContent,
  PaymentStatus,
} from '@/domain/entities';
import {
  ProcessPaymentWebhook,
  ProcessPaymentWebhookInput,
} from '@/domain/use-cases/payment/process-payment-webhook';
import { Injectable, NotFoundException, Provider } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Observable, from, tap, mergeMap, catchError } from 'rxjs';
import { WinstonAdapter } from '@/infrastructure/services/logger/adapters/winston.adapter';
import { UnprocessablePaymentError } from '@application/payment/errors/unprocessable-payment.error';
import {
  WebhookLoggerContract,
  WebhookProccessingStatus,
} from '@/domain/contracts/infra-layer/payment-gateway/webhook-logger.contract';
import { ApprovePaymentCommand } from '@application/payment/commands/models/approve-payment.command';
import { RefusePaymentCommand } from '@application/payment/commands/models/refuse-payment.command';
import { CancelPaymentCommand } from '../commands/models/cancel-payment.command';
import { ApprovePaymentNotContentCommand } from '../commands/models/approve-payment-not-content.command';

@Injectable()
export class ProcessPaymentWebhookUseCase implements ProcessPaymentWebhook {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
    private readonly loggerService: WinstonAdapter,
    private readonly webhookLogger: WebhookLoggerContract,
  ) {}
  execute(input: ProcessPaymentWebhookInput): Observable<void> {
    const gatewayByIdQuery = new GatewayByIdQuery(input.gatewayId);
    const gatewayQuery = this.queryBus.execute(gatewayByIdQuery);

    return from(gatewayQuery).pipe(
      tap((gateway) => {
        if (!gateway) {
          throw new NotFoundException("This request can't be processed");
        }
      }),
      mergeMap((gateway: IGateway) => {
        const paymentGatewayInstance =
          this.paymentGatewayFactory.getPaymentGateway(gateway.player);

        const instance = paymentGatewayInstance.getPaymentTransaction(
          WebhookPaymentTransaction,
        );

        const webhookProcess = instance.execute({
          tenantId: input.tenantId,
          payload: input.payload,
        });

        return from(webhookProcess);
      }),
      mergeMap((response: WebhookPaymentTransactionOutputType) => {
        const payment$ = this.queryBus.execute(response.paymentQuery);

        let paymentExists = true;
        return from(payment$).pipe(
          tap((payment: IPayment) => {
            if (!payment) {
              paymentExists = false;
              return;
            }
            if (payment.status !== PaymentStatus.WAITING) {
              throw new UnprocessablePaymentError(
                `Payment cannot be approved because the actual status is [${payment.status}]`,
              );
            }
          }),
          mergeMap((payment: IPayment) => {
            if (
              !paymentExists &&
              PaymentStatus.APPROVED === response.paymentStatus &&
              input.gatewayId === process.env.PAGARME_GATEWAYID
            ) {
              const newPayment = {
                paymentId: input.payload.data.charges[0].id,
                status: PaymentStatus.APPROVED,
              } as IPaymentNotContent;
              const payload = new ApprovePaymentNotContentCommand(newPayment);
              return from(this.commandBus.execute(payload));
            }
            if (PaymentStatus.APPROVED === response.paymentStatus) {
              const approveCommand = new ApprovePaymentCommand(
                payment,
                payment.transactions,
              );

              return from(this.commandBus.execute(approveCommand));
            } else if (PaymentStatus.REFUNDED === response.paymentStatus) {
              const cancelCommand = new CancelPaymentCommand(
                payment,
                payment.transactions,
              );

              return from(this.commandBus.execute(cancelCommand));
            } else {
              const refuseCommand = new RefusePaymentCommand(payment);

              return from(this.commandBus.execute(refuseCommand));
            }
          }),
        );
      }),
      mergeMap(() => {
        return this.webhookLogger.captureLog({
          tenantId: input.tenantId,
          gatewayId: input.gatewayId,
          createdAt: new Date(),
          payload: input.payload,
          reason: 'Webhook proccessed with success',
          status: WebhookProccessingStatus.SUCCESS,
        });
      }),
      catchError((error: Error) => {
        this.loggerService.error(error);

        return this.webhookLogger.captureLog({
          tenantId: input.tenantId,
          gatewayId: input.gatewayId,
          createdAt: new Date(),
          payload: input.payload,
          reason: error?.message || 'Failure to process this webhook',
          status: WebhookProccessingStatus.FAILURE,
        });
      }),
    );
  }
}

export const ProcessWebhookUseCaseProvider: Provider = {
  provide: ProcessPaymentWebhook,
  useClass: ProcessPaymentWebhookUseCase,
};
