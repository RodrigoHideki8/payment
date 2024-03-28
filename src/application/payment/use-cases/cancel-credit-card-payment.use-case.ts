import {
  CancelCreditCardPayment,
  CancelCreditCardPaymentInput,
  CancelCreditCardPaymentOutput,
} from '@/domain/use-cases/payment/cancel-credit-card-payment';
import { Injectable, Provider } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { from, map, mergeMap, Observable, tap } from 'rxjs';
import { CancelPaymentCommand } from '@/application/payment/commands/models/cancel-payment.command';
import { PaymentGatewayFactory } from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway.contract';
import { IPayment, PaymentType } from '@/domain/entities/payment';
import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { DomainEvent } from '@/domain/events/domain-event';
import {
  CancelPaymentOutputType,
  CancelCreditCardPaymentTransaction,
  CancelPaymentInputType,
} from '@/domain/contracts/infra-layer/payment-gateway';
import { Payment } from '@/application/payment/payment';
import { GatewayByIdQuery } from '@/application/gateway/queries/models/gateway-by-id.query';
import { IGateway } from '@/domain/entities';
import {
  PaymentNotFoundError,
  UnprocessablePaymentError,
} from '@/application/payment/errors';

@Injectable()
export class CancelCreditCardPaymentUseCase implements CancelCreditCardPayment {
  constructor(
    private commandBus: CommandBus,
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
    private readonly eventStore: EventStore<IPayment>,
    private readonly queryBus: QueryBus,
  ) {}

  execute(
    input?: CancelCreditCardPaymentInput,
  ): Observable<CancelCreditCardPaymentOutput> {
    const lastOccurrence$ = this.eventStore.getLastOccurrenceTo(
      input.aggregateId,
      Payment.name,
    );

    return from(lastOccurrence$).pipe(
      tap((payment: DomainEvent<IPayment>) => {
        if (!payment) {
          throw new PaymentNotFoundError(
            `Payment [${input.aggregateId}] not found.`,
          );
        }
      }),
      map(
        (domainEvent: DomainEvent<IPayment>) => domainEvent.payload as IPayment,
      ),
      tap((payment) => {
        if (payment.type !== PaymentType.CREDIT_CARD) {
          throw new UnprocessablePaymentError(
            `Invalid Payment Type [${payment.type}].`,
          );
        }
      }),
      mergeMap((payment: IPayment) => {
        const gatewayByIdQuery = new GatewayByIdQuery(payment.gatewayId);
        const gatewayQuery$ = this.queryBus.execute(gatewayByIdQuery);

        return from(gatewayQuery$).pipe(
          mergeMap((gateway: IGateway) => {
            const paymentGatewayInstance =
              this.paymentGatewayFactory.getPaymentGateway(gateway.player);

            const instance = paymentGatewayInstance.getPaymentTransaction(
              CancelCreditCardPaymentTransaction,
            );

            const cancelPayment: CancelPaymentInputType = {
              payment: payment,
              gateway: gateway,
            };

            const paymentTransaction$ = instance.execute(cancelPayment);

            return from(paymentTransaction$);
          }),
          mergeMap((cancelResult: CancelPaymentOutputType) => {
            const cancelPaymentCommand = new CancelPaymentCommand(
              payment,
              cancelResult.payments.map((payment) => {
                return {
                  transactionId: payment.paymentId,
                  nsu: payment.nsu,
                  amount: payment.amount,
                  gatewayStatus: payment.gatewayStatus,
                };
              }),
            );

            return from(this.commandBus.execute(cancelPaymentCommand)).pipe(
              map((payment: IPayment) => {
                return {
                  description: cancelResult.description,
                  aggregateId: payment.id,
                  authorizationCode: cancelResult.authorizationCode,
                  amount: payment.amount,
                  releaseAt: cancelResult.releaseAt,
                  status: payment.status,
                } as CancelCreditCardPaymentOutput;
              }),
            );
          }),
        );
      }),
    );
  }
}

export const CancelPaymentUseCaseProvider: Provider = {
  provide: CancelCreditCardPayment,
  useClass: CancelCreditCardPaymentUseCase,
};
