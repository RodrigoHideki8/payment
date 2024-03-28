import {
  CreateCreditCardPayment,
  CreateCreditCardPaymentInput,
  CreateCreditCardPaymentOutput,
} from '@/domain/use-cases/payment/create-credit-card-payment';
import { from, Observable, map, mergeMap, tap, catchError } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Provider } from '@nestjs/common/interfaces';
import {
  IBuyer,
  IGateway,
  IPayment,
  PaymentStatus,
  PaymentType,
} from '@/domain/entities';
import { UnprocessablePaymentError } from '@/application/payment/errors';
import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { Buyer } from '@/application/buyer/buyer';
import { DomainEvent } from '@/domain/events/domain-event';
import { PaymentGatewayFacade } from '@/application/payment/facade/payment-gateway.facade';
import {
  CreditCardPaymentInputType,
  CreditCardPaymentOutputType,
  CreditCardPaymentTransaction,
  PaymentGatewayFactory,
} from '@/domain/contracts/infra-layer/payment-gateway';
import { CreatePaymentCommand } from '@/application/payment/commands/models/create-payment.command';
import { UniqueIdentifier } from '@/domain/entities/types';
import { isTruthy } from '@/domain/utils/string.utils';

@Injectable()
export class CreateCreditCardPaymentUseCase implements CreateCreditCardPayment {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStore<IBuyer>,
    private readonly paymentGatewayFacade: PaymentGatewayFacade,
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
  ) {}

  execute(
    input: CreateCreditCardPaymentInput,
  ): Observable<CreateCreditCardPaymentOutput> {
    this.validateInput(input);

    return from(this.validateBuyer(input.buyerId)).pipe(
      mergeMap((buyer: IBuyer) => {
        return from(this.chooseGateway(input)).pipe(
          mergeMap((gateway: IGateway) => {
            return this.createPayment(input, buyer, gateway).pipe(
              catchError((error: any) => {
                const creditCardRule = gateway.rules.filter(
                  (rule) => rule.paymentType === PaymentType.CREDIT_CARD,
                );
                if (creditCardRule.length > 0 && creditCardRule[0].retryIn) {
                  return this.createPaymentInGatewayCallback(
                    input,
                    buyer,
                    creditCardRule[0].retryIn,
                  );
                }
                throw error;
              }),
            );
          }),
        );
      }),
    );
  }

  private chooseGateway(
    input: CreateCreditCardPaymentInput,
  ): Promise<IGateway> {
    let gatewayPriority = undefined;

    for (const payment of input.payments) {
      for (const split of payment.split) {
        const externalInfo = split.externalInfos.filter(
          (info) => info.priority,
        );
        if (externalInfo.length > 0) gatewayPriority = externalInfo[0].gateway;
      }
    }

    if (gatewayPriority) {
      return this.paymentGatewayFacade.getPaymentGatewayByPlayer(
        input.tenantId,
        gatewayPriority,
      );
    }

    return this.paymentGatewayFacade.choosePaymentGateway(
      input.tenantId,
      PaymentType.CREDIT_CARD,
      input.amount,
      input.installments,
    );
  }

  private createPaymentInGatewayCallback(
    input: CreateCreditCardPaymentInput,
    buyer: IBuyer,
    gatewayPlayer: string,
  ): Observable<CreateCreditCardPaymentOutput> {
    const gateway$ = this.paymentGatewayFacade.getPaymentGatewayByPlayer(
      input.tenantId,
      gatewayPlayer,
    );
    return from(gateway$).pipe(
      mergeMap((gateway: IGateway) => {
        return this.createPayment(input, buyer, gateway);
      }),
    );
  }

  private verifyStatusPayment(
    response: CreditCardPaymentOutputType,
    input: CreateCreditCardPaymentInput,
    buyer: IBuyer,
    gateway: IGateway,
  ) {
    if (
      !(
        response.status === PaymentStatus.APPROVED ||
        response.status === PaymentStatus.WAITING ||
        response.status === PaymentStatus.CREATED ||
        response.status === PaymentStatus.PRE_APPROVED
      )
    ) {
      const creditCardRule = gateway.rules.filter(
        (rule) => rule.paymentType === PaymentType.CREDIT_CARD,
      );
      if (creditCardRule.length > 0 && creditCardRule[0].retryIn) {
        return this.createPaymentInGatewayCallback(
          input,
          buyer,
          creditCardRule[0].retryIn,
        );
      }
    }
    return response;
  }

  private createPayment(
    input: CreateCreditCardPaymentInput,
    buyer: IBuyer,
    gateway: IGateway,
  ): Observable<CreateCreditCardPaymentOutput> {
    const {
      tenantId,
      buyerId,
      metadata,
      softDescription,
      orderId,
      accountId,
      captureType,
      installments,
      amount,
      payments,
    } = input;

    const paymentGatewayInstance = this.paymentGatewayFactory.getPaymentGateway(
      gateway.player,
    );

    const paymentRequest: CreditCardPaymentInputType = {
      buyer: buyer,
      payments: payments,
      orderId: orderId,
      softDescription: softDescription,
      captureType: captureType,
      metadata: metadata,
      installments: installments,
      amount: amount,
      gateway: gateway,
    };

    const instance = paymentGatewayInstance.getPaymentTransaction(
      CreditCardPaymentTransaction,
    );

    const gatewayResponse$ = instance.execute(paymentRequest);

    return from(gatewayResponse$).pipe(
      map((response: CreditCardPaymentOutputType) =>
        this.verifyStatusPayment(response, input, buyer, gateway),
      ),
      mergeMap((response: CreditCardPaymentOutputType) => {
        const createPaymentCommand = new CreatePaymentCommand(
          tenantId,
          buyerId,
          metadata,
          orderId,
          accountId,
          amount,
          gateway.id,
          PaymentType.CREDIT_CARD,
          response.status,
          response.payments.map((payment) => {
            return {
              transactionId: payment.paymentId,
              nsu: payment.nsu,
              amount: payment.amount,
              gatewayStatus: payment.gatewayStatus,
              description: payment.description,
            };
          }),
          installments,
          captureType,
          payments.map((payment) => {
            const { creditCard, ...data } = payment;
            return { ...data };
          }),
        );

        return from(this.commandBus.execute(createPaymentCommand)).pipe(
          map((payment: IPayment) => {
            return {
              aggregateId: payment.id,
              status: payment.status,
              orderId: payment.orderId,
              transactions: payment.transactions,
              gatewayId: payment.gatewayId,
              amount: payment.amount,
              description: response.description,
            } as CreateCreditCardPaymentOutput;
          }),
        );
      }),
    );
  }

  private validateBuyer(buyerId: UniqueIdentifier): Observable<IBuyer> {
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
    );
  }

  private validateInput(input: CreateCreditCardPaymentInput) {
    this.validatePaymentAmount(input);
    this.validatePrincipalAccountOnSplit(input);
  }

  private validatePaymentAmount(input: CreateCreditCardPaymentInput) {
    const paymentsAmount = input.payments.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );

    if (input.amount !== paymentsAmount)
      throw new UnprocessablePaymentError(
        'The payments amount sum is different of total amount',
      );
  }

  private validatePrincipalAccountOnSplit(input: CreateCreditCardPaymentInput) {
    for (const payment of input.payments) {
      const principalAccount = payment.split.filter((split) =>
        isTruthy(split.principal),
      );

      if (principalAccount.length < 1)
        throw new UnprocessablePaymentError(
          'At least one principal account must be declared on the split!',
        );

      if (principalAccount.length > 1)
        throw new UnprocessablePaymentError(
          'Splits can only have one principal account!',
        );
    }
  }
}

export const CreateCreditCardPaymentUseCaseProvider: Provider = {
  provide: CreateCreditCardPayment,
  useClass: CreateCreditCardPaymentUseCase,
};
