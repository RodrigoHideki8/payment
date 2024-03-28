import {
  CreatePixPayment,
  CreatePixPaymentInput,
  CreatePixPaymentOutput,
} from '@/domain/use-cases/payment/create-pix-payment';
import { from, Observable, map, mergeMap, tap } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePaymentCommand } from '@/application/payment/commands/models/create-payment.command';
import { Provider } from '@nestjs/common/interfaces';
import { PaymentGatewayFactory } from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway.contract';
import {
  PixPaymentInputType,
  PixPaymentOutputType,
  PixPaymentTransaction,
} from '@/domain/contracts/infra-layer/payment-gateway';
import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { IBuyer, IGateway, IPayment, PaymentType } from '@/domain/entities';
import { Buyer } from '@/application/buyer/buyer';
import { UnprocessablePaymentError } from '@/application/payment/errors';
import { DomainEvent } from '@/domain/events/domain-event';
import { PaymentGatewayFacade } from '@/application/payment/facade/payment-gateway.facade';

@Injectable()
export class CreatePixPaymentUseCase implements CreatePixPayment {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStore<IBuyer>,
    private readonly paymentGatewayFacade: PaymentGatewayFacade,
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
  ) {}

  execute(input: CreatePixPaymentInput): Observable<CreatePixPaymentOutput> {
    const {
      tenantId,
      buyerId,
      metadata,
      softDescription,
      orderId,
      amount,
      expiresAt,
      accountId,
      split,
    } = input;

    const buyerQuery$ = this.eventStore.getLastOccurrenceTo(
      buyerId,
      Buyer.name,
    );

    return from(buyerQuery$).pipe(
      tap((domainEvent: DomainEvent<IBuyer>) => {
        if (!domainEvent) {
          throw new UnprocessablePaymentError('Buyer not found!');
        }
      }),
      map((domainEvent: DomainEvent<IBuyer>) => {
        return domainEvent.payload as IBuyer;
      }),
      mergeMap((buyer: IBuyer) => {
        const gateway$ = this.paymentGatewayFacade.choosePaymentGateway(
          tenantId,
          PaymentType.PIX,
          amount,
        );

        return from(gateway$).pipe(
          mergeMap((gateway: IGateway) => {
            const paymentGatewayInstance =
              this.paymentGatewayFactory.getPaymentGateway(gateway.player);

            const paymentRequest: PixPaymentInputType = {
              tenantId: tenantId,
              orderNumber: orderId,
              softDescription: softDescription,
              buyer: buyer,
              gateway: gateway,
              amount: amount,
              expiresAt: expiresAt,
              split: split,
            };

            const instance = paymentGatewayInstance.getPaymentTransaction(
              PixPaymentTransaction,
            );

            const gatewayResponse$ = instance.execute(paymentRequest);

            return from(gatewayResponse$).pipe(
              mergeMap((response: PixPaymentOutputType) => {
                const createPaymentCommand = new CreatePaymentCommand(
                  tenantId,
                  buyerId,
                  metadata,
                  orderId,
                  accountId,
                  amount,
                  gateway.id,
                  PaymentType.PIX,
                  response.status,
                  [{ transactionId: response.paymentId }],
                  1,
                  null,
                  [
                    {
                      amount,
                      split,
                    },
                  ],
                  expiresAt,
                );

                return from(this.commandBus.execute(createPaymentCommand)).pipe(
                  map((payment: IPayment) => {
                    return {
                      aggregateId: payment.id,
                      status: payment.status,
                      orderId: payment.orderId,
                      gatewayId: payment.gatewayId,
                      amount: payment.amount,
                      expiresAt: payment.expirationAt,
                      qrCode: response.qrCode,
                      qrUrl: response.qrUrl,
                      transactionId: response.paymentId,
                    } as CreatePixPaymentOutput;
                  }),
                );
              }),
            );
          }),
        );
      }),
    );
  }
}

export const CreatePixPaymentUseCaseProvider: Provider = {
  provide: CreatePixPayment,
  useClass: CreatePixPaymentUseCase,
};
