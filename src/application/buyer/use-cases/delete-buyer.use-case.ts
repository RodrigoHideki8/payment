import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { IBuyer } from '@/domain/entities';
import { DomainEvent } from '@/domain/events/domain-event';
import { DeleteBuyerCommand } from '@/application/buyer/commands/models';
import { DeleteBuyer } from '@domain/use-cases/buyer';
import { Injectable, Provider } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Observable, from, map, switchMap, tap } from 'rxjs';
import { Buyer } from '../buyer';
import { UniqueIdentifier } from '@/domain/entities/types';
import { BuyerNotFoundError } from '../errors/buyer-not-found.error';

@Injectable()
export class DeleteBuyerUseCase implements DeleteBuyer {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStore<IBuyer>,
  ) {}
  execute(aggregateId: UniqueIdentifier): Observable<void> {
    const lastOccurrence$ = this.eventStore.getLastOccurrenceTo(
      aggregateId,
      Buyer.name,
    );
    return from(lastOccurrence$).pipe(
      tap((buyer: DomainEvent<IBuyer>) => {
        if (!buyer == null)
          throw new BuyerNotFoundError(
            `Buyer with id [${aggregateId}] not found.`,
          );
      }),
      map((domainEvent) => domainEvent.payload),
      switchMap((buyer: IBuyer) => {
        const deleteBuyerCommand = new DeleteBuyerCommand(buyer);
        const command$ = this.commandBus.execute(deleteBuyerCommand);
        return from(command$).pipe(map(() => void 0));
      }),
    );
  }
}
export const DeleteBuyerUseCaseProvider: Provider = {
  provide: DeleteBuyer,
  useClass: DeleteBuyerUseCase,
};
