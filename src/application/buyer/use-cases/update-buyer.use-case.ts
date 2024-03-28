import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { IBuyer } from '@/domain/entities';
import { DomainEvent } from '@/domain/events/domain-event';
import { UpdateBuyerCommand } from '@/application/buyer/commands/models/update-buyer.command';
import { Buyer } from '@/application/buyer/buyer';
import {
  UpdateBuyer,
  UpdateBuyerInput,
  UpdateBuyerOutput,
} from '@domain/use-cases/buyer';
import { Injectable, Provider } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { from, map, Observable, switchMap, tap } from 'rxjs';
import { BuyerNotFoundError } from '../errors/buyer-not-found.error';

@Injectable()
export class UpdateBuyerUseCase implements UpdateBuyer {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStore<IBuyer>,
  ) {}
  execute(input: UpdateBuyerInput): Observable<UpdateBuyerOutput> {
    const lastOccurrence$ = this.eventStore.getLastOccurrenceTo(
      input.aggregateId,
      Buyer.name,
    );
    return from(lastOccurrence$).pipe(
      tap((buyer: DomainEvent<IBuyer>) => {
        if (!buyer)
          throw new BuyerNotFoundError(
            `Buyer with id [${input.aggregateId}] not found.`,
          );
      }),
      map((domainEvent) => domainEvent.payload),
      switchMap((buyer: IBuyer) => {
        delete input.aggregateId;
        Object.assign(buyer, input);
        buyer = Buyer.fromIBuyer(buyer);
        const updateBuyerCommand = new UpdateBuyerCommand(buyer);
        const command$ = this.commandBus.execute(updateBuyerCommand);
        return from(command$).pipe(
          map((updatedBuyer: IBuyer) => {
            return { id: updatedBuyer.id };
          }),
        );
      }),
    );
  }
}
export const UpdateBuyerUseCaseProvider: Provider = {
  provide: UpdateBuyer,
  useClass: UpdateBuyerUseCase,
};
