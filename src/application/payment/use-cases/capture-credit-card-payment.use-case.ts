import { from, Observable, map, mergeMap, tap } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Provider } from '@nestjs/common/interfaces';
import { PaymentGatewayFactory } from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway.contract';
import {
  CaptureCreditCardPayment,
  CaptureCreditCardPaymentInput,
  CaptureCreditCardPaymentOutput,
} from '@/domain/use-cases/payment/capture-credit-card-payment';
import { IPayment, PaymentStatus } from '@/domain/entities/payment';
import {
  CaptureCreditCardPaymentInputType,
  CaptureCreditCardPaymentOutputType,
  CaptureCreditCardPaymentTransaction,
} from '@/domain/contracts/infra-layer/payment-gateway';
import {
  InvalidPaymentStatusError,
  PaymentNotFoundError,
} from '@application/payment/errors';
import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { Payment } from '@/application/payment/payment';
import { DomainEvent } from '@/domain/events/domain-event';
import { GatewayByIdQuery } from '@/application/gateway/queries/models/gateway-by-id.query';
import { IGateway } from '@/domain/entities';
import { ApprovePaymentCommand } from '../commands/models/approve-payment.command';
import { RefusePaymentCommand } from '../commands/models/refuse-payment.command';

@Injectable()
export class CaptureCreditCardPaymentUseCase
  implements CaptureCreditCardPayment
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
    private readonly eventStore: EventStore<IPayment>,
    private readonly queryBus: QueryBus,
  ) {}

  execute(
    input: CaptureCreditCardPaymentInput,
  ): Observable<CaptureCreditCardPaymentOutput> {
    const lastOccurrence$ = this.eventStore.getLastOccurrenceTo(
      input.aggregateId,
      Payment.name,
    );

    return from(lastOccurrence$).pipe(
      tap((payment: DomainEvent<IPayment>) => {
        if (!payment)
          throw new PaymentNotFoundError(
            `Payment [${input.aggregateId}] not found.`,
          );
      }),
      map(
        (domainEvent: DomainEvent<IPayment>) => domainEvent.payload as IPayment,
      ),
      tap((payment) => {
        if (payment.status !== PaymentStatus.PRE_APPROVED)
          throw new InvalidPaymentStatusError(
            'Invalid payment status. This payment cannot be captured.',
          );
      }),
      mergeMap((payment: IPayment) => {
        const { id, tenantId, amount, gatewayId, transactions } = payment;

        const gatewayByIdQuery = new GatewayByIdQuery(gatewayId);
        const gatewayQuery$ = this.queryBus.execute(gatewayByIdQuery);

        return from(gatewayQuery$).pipe(
          mergeMap((gateway: IGateway) => {
            const paymentGatewayInstance =
              this.paymentGatewayFactory.getPaymentGateway(gateway.player);

            const instance = paymentGatewayInstance.getPaymentTransaction(
              CaptureCreditCardPaymentTransaction,
            );

            const capturePayment: CaptureCreditCardPaymentInputType = {
              paymentId: transactions[0].transactionId,
              amount: amount,
              gateway: gateway,
            };

            const paymentTransaction$ = instance.execute(capturePayment);

            return from(paymentTransaction$);
          }),
          mergeMap((captureResult: CaptureCreditCardPaymentOutputType) => {
            if (PaymentStatus.APPROVED === captureResult.status) {
              const approvePaymentCommand = new ApprovePaymentCommand(
                payment,
                captureResult.payments.map((payment) => {
                  return {
                    transactionId: payment.paymentId,
                    nsu: payment.nsu,
                    amount: payment.amount,
                    gatewayStatus: payment.gatewayStatus,
                  };
                }),
              );
              return from(this.commandBus.execute(approvePaymentCommand));
            } else {
              const refusePaymentCommand = new RefusePaymentCommand(payment);
              return from(this.commandBus.execute(refusePaymentCommand));
            }
          }),
          map((payment: IPayment) => {
            return {
              aggregateId: payment.id,
              status: payment.status,
              orderId: payment.orderId,
              gatewayId: payment.gatewayId,
              amount: input.amount,
            } as CaptureCreditCardPaymentOutput;
          }),
        );
      }),
    );
  }
}

export const CaptureCreditCardPaymentUseCaseProvider: Provider = {
  provide: CaptureCreditCardPayment,
  useClass: CaptureCreditCardPaymentUseCase,
};
