import {
  CreateBilletPayment,
  CreateBilletPaymentInput,
  CreateBilletPaymentOutput,
} from '@/domain/use-cases/payment/create-billet-payment';
import { from, Observable, map, mergeMap, tap } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePaymentCommand } from '@/application/payment/commands/models/create-payment.command';
import { Provider } from '@nestjs/common/interfaces';
import {
  PaymentGatewayFactory,
  BilletPaymentInputType,
  BilletPaymentTransaction,
  BilletPaymentOutputType,
} from '@/domain/contracts/infra-layer/payment-gateway';
import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { IBuyer, IGateway, IPayment, PaymentType } from '@/domain/entities';
import { PaymentGatewayFacade } from '@/application/payment/facade/payment-gateway.facade';
import { Buyer } from '@/application/buyer/buyer';
import { DomainEvent } from '@/domain/events/domain-event';
import { UnprocessablePaymentError } from '../errors';

@Injectable()
export class CreateBilletPaymentUseCase implements CreateBilletPayment {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStore<IBuyer>,
    private readonly paymentGatewayFacade: PaymentGatewayFacade,
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
  ) {}

  execute(
    input: CreateBilletPaymentInput,
  ): Observable<CreateBilletPaymentOutput> {
    const {
      tenantId,
      buyerId,
      metadata,
      softDescription,
      orderId,
      accountId,
      amount,
      expiresAt,
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
          PaymentType.BILLET,
          amount,
        );

        return from(gateway$).pipe(
          mergeMap((gateway: IGateway) => {
            const paymentGatewayInstance =
              this.paymentGatewayFactory.getPaymentGateway(gateway.player);

            const paymentRequest: BilletPaymentInputType = {
              buyer: buyer,
              orderNumber: orderId as string,
              softDescription: softDescription,
              amount: amount,
              expiresAt: expiresAt,
              gateway: gateway,
              split: split,
            };

            const instance = paymentGatewayInstance.getPaymentTransaction(
              BilletPaymentTransaction,
            );

            const gatewayResponse$ = instance.execute(paymentRequest);

            return from(gatewayResponse$).pipe(
              mergeMap((response: BilletPaymentOutputType) => {
                const createPaymentCommand = new CreatePaymentCommand(
                  tenantId,
                  buyerId,
                  metadata,
                  orderId,
                  accountId,
                  amount,
                  gateway.id,
                  PaymentType.BILLET,
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
                      orderId: orderId,
                      gatewayId: gateway.id,
                      amount: amount,
                      expiresAt: response.expiresAt,
                      qrCode: response.qrCode,
                      ourNumber: response.ourNumber,
                      barCode: response.barCode,
                      pdfUrl: response.pdfUrl,
                      transactionId: response.paymentId,
                    } as CreateBilletPaymentOutput;
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

export const CreateBilletPaymentUseCaseProvider: Provider = {
  provide: CreateBilletPayment,
  useClass: CreateBilletPaymentUseCase,
};
