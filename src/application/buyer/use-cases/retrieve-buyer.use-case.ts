import { RetrieveBuyerQuery } from '@/application/buyer/queries/models';
import { IBuyer } from '@/domain/entities';
import {
  RetrieveBuyer,
  RetrieveBuyerOutput,
} from '@/domain/use-cases/buyer/retrieve-buyer';
import { Injectable, Provider } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { from, map, Observable, tap } from 'rxjs';
import { BuyerNotFoundError } from '../errors/buyer-not-found.error';
import { UniqueIdentifier } from '@/domain/entities/types';

@Injectable()
export class RetrieveBuyerUseCase implements RetrieveBuyer {
  constructor(private queryBus: QueryBus) {}
  execute(aggregateId: UniqueIdentifier): Observable<RetrieveBuyerOutput> {
    const retrieveBuyerCommand = new RetrieveBuyerQuery(aggregateId);
    const query$ = this.queryBus.execute(retrieveBuyerCommand);
    return from(query$).pipe(
      tap((buyer: IBuyer) => {
        if (!buyer) throw new BuyerNotFoundError(`Buyer not found`);
      }),
      map((buyer: IBuyer) => {
        return { ...buyer } as RetrieveBuyerOutput;
      }),
    );
  }
}

export const RetrieveBuyerUseCaseProvider: Provider = {
  provide: RetrieveBuyer,
  useClass: RetrieveBuyerUseCase,
};
