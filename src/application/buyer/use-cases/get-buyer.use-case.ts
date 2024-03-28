import {
  GetBuyer,
  GetBuyerInput,
  GetBuyerOutput,
} from '@/domain/use-cases/buyer/get-buyer';
import { Injectable } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces';
import { QueryBus } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { BuyerQuery } from '@/application/buyer/queries/models/buyer.query';

@Injectable()
export class GetBuyerUseCase implements GetBuyer {
  constructor(private readonly commandBus: QueryBus) {}

  execute(input: GetBuyerInput): Observable<GetBuyerOutput> {
    return from(
      this.commandBus.execute(
        new BuyerQuery(
          input.id,
          input.name,
          input.email,
          input.documentValue,
          input.page,
          input.size,
        ),
      ),
    );
  }
}

export const GetBuyerUseCaseProvider: Provider = {
  provide: GetBuyer,
  useClass: GetBuyerUseCase,
};
