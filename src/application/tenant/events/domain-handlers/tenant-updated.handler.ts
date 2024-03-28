import { TenantUpdatedEvent } from '@application/tenant/events/models/tenant-updated.event';
import { EventStore } from '@domain/contracts/infra-layer/repository/event-store.repository';
import { ITenant } from '@domain/entities/tenant';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(TenantUpdatedEvent)
export class TenantUpdatedEventHandler
  implements IEventHandler<TenantUpdatedEvent>
{
  constructor(
    private readonly eventStore: EventStore<ITenant>,
    private readonly integrationEventEmitter: EventEmitter2,
  ) {}
  async handle(event: TenantUpdatedEvent) {
    await this.eventStore.append(event);
    this.integrationEventEmitter.emit(TenantUpdatedEvent.name, event);
  }
}
