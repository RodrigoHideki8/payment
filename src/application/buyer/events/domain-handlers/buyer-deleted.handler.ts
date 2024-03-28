import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { IBuyer } from '@/domain/entities';
import { BuyerDeletedEvent } from '@/application/buyer/events/models';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(BuyerDeletedEvent)
export class BuyerDeletedEventHandler
  implements IEventHandler<BuyerDeletedEvent>
{
  constructor(
    private readonly eventStore: EventStore<IBuyer>,
    private readonly integrationEventEmitter: EventEmitter2,
  ) {}
  async handle(event: BuyerDeletedEvent) {
    await this.eventStore.append(event);
    this.integrationEventEmitter.emit(BuyerDeletedEvent.name, event);
  }
}
