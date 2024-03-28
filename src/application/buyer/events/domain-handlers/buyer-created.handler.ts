import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { IBuyer } from '@/domain/entities';
import { BuyerCreatedEvent } from '@/application/buyer/events/models';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(BuyerCreatedEvent)
export class BuyerCreatedEventHandler
  implements IEventHandler<BuyerCreatedEvent>
{
  constructor(
    private readonly eventStore: EventStore<IBuyer>,
    private readonly integrationEventEmitter: EventEmitter2,
  ) {}
  async handle(event: BuyerCreatedEvent) {
    await this.eventStore.append(event);
    this.integrationEventEmitter.emit(BuyerCreatedEvent.name, event);
  }
}
