import { BuyerUpdatedEvent } from '@/application/buyer/events/models';
import { EventStore } from '@domain/contracts/infra-layer/repository/event-store.repository';
import { IBuyer } from '@domain/entities';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(BuyerUpdatedEvent)
export class BuyerUpdatedEventHandler
  implements IEventHandler<BuyerUpdatedEvent>
{
  constructor(
    private readonly eventStore: EventStore<IBuyer>,
    private readonly integrationEventEmitter: EventEmitter2,
  ) {}
  async handle(event: BuyerUpdatedEvent) {
    await this.eventStore.append(event);
    this.integrationEventEmitter.emit(BuyerUpdatedEvent.name, event);
  }
}
