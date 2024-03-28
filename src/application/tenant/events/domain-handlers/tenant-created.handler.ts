import { TenantCreatedEvent } from '@application/tenant/events/models/tenant-created.event';
import { EventStore } from '@domain/contracts/infra-layer/repository/event-store.repository';
import { ITenant } from '@domain/entities/tenant';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(TenantCreatedEvent)
export class TenantCreatedEventHandler
  implements IEventHandler<TenantCreatedEvent>
{
  constructor(
    private readonly eventStore: EventStore<ITenant>,
    private readonly integrationEventEmitter: EventEmitter2,
  ) {}
  async handle(event: TenantCreatedEvent) {
    await this.eventStore.append(event);
    this.integrationEventEmitter.emit(TenantCreatedEvent.name, event);
  }
}
