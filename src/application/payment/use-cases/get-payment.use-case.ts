import { PaymentQuery } from '@/application/payment/queries/models/payment.query';
import {
  GetPayment,
  GetPaymentInput,
  GetPaymentOutput,
} from '@/domain/use-cases/payment/get-payment';
import { Injectable } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces';
import { QueryBus } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';

@Injectable()
export class GetPaymentUseCase implements GetPayment {
  constructor(private readonly commandBus: QueryBus) {}

  execute(input: GetPaymentInput): Observable<GetPaymentOutput> {
    return from(
      this.commandBus.execute(
        new PaymentQuery(
          input.id,
          input.orderId,
          input.accountId,
          input.buyerId,
          input.status,
          input.startDate,
          input.endDate,
          input.page,
          input.size,
          input.tenantId,
        ),
      ),
    );
  }
}

export const GetPaymentUseCaseProvider: Provider = {
  provide: GetPayment,
  useClass: GetPaymentUseCase,
};
