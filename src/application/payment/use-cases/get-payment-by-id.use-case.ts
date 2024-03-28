import {
  GetPaymentById,
  GetPaymentByIdInput,
  GetPaymentByIdOutput,
} from '@/domain/use-cases/payment/get-payment-by-id';
import { Injectable } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces';
import { QueryBus } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { PaymentByIdQuery } from '../queries/models/get-by-id.query';

@Injectable()
export class GetPaymentByIdUseCase implements GetPaymentById {
  constructor(private readonly commandBus: QueryBus) {}

  execute(input: GetPaymentByIdInput): Observable<GetPaymentByIdOutput> {
    return from(
      this.commandBus.execute(new PaymentByIdQuery(input.aggregateId)),
    );
  }
}

export const GetPaymentByIdUseCaseProvider: Provider = {
  provide: GetPaymentById,
  useClass: GetPaymentByIdUseCase,
};
