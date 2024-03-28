import { Injectable, Provider } from '@nestjs/common';
import {
  CancelPixPayment,
  CancelPixPaymentInput,
  CancelPixPaymentOutput,
} from '@/domain/use-cases/payment/cancel-pix-payment';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CancelPaymentInputType,
  CancelPaymentOutputType,
  CancelPixPaymentTransaction,
  PaymentGatewayFactory,
} from '@/domain/contracts/infra-layer/payment-gateway';
import { IGateway, IPayment, PaymentType } from '@/domain/entities';
import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { DomainEvent } from '@/domain/events/domain-event';
import { PaymentNotFoundError, UnprocessablePaymentError } from '../errors';
import { Observable, tap, map, from, mergeMap } from 'rxjs';
import { Payment } from '../payment';
import { GatewayByIdQuery } from '@/application/gateway/queries/models/gateway-by-id.query';
import { CancelPaymentCommand } from '../commands/models/cancel-payment.command';

@Injectable()
export class CancelPixPaymentUseCase implements CancelPixPayment {
  constructor(
    private commandBus: CommandBus,
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
    private readonly eventStore: EventStore<IPayment>,
    private readonly queryBus: QueryBus,
  ) {}

  execute(input?: CancelPixPaymentInput): Observable<CancelPixPaymentOutput> {
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
        if (payment.type !== PaymentType.PIX) {
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
              CancelPixPaymentTransaction,
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
                  status: payment.status,
                } as CancelPixPaymentOutput;
              }),
            );
          }),
        );
      }),
    );
  }
}

export const CancelPixPaymentUseCaseProvider: Provider = {
  provide: CancelPixPayment,
  useClass: CancelPixPaymentUseCase,
};
