import { GatewayUpdatedEvent } from '@application/gateway/events/models/gateway-updated.event';
import { EventStore } from '@domain/contracts/infra-layer/repository/event-store.repository';
import { IGateway } from '@domain/entities/gateway';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(GatewayUpdatedEvent)
export class GatewayUpdatedEventHandler
  implements IEventHandler<GatewayUpdatedEvent>
{
  constructor(
    private readonly eventStore: EventStore<IGateway>,
    private readonly integrationEventEmitter: EventEmitter2,
  ) {}
  async handle(event: GatewayUpdatedEvent) {
    await this.eventStore.append(event);
    this.integrationEventEmitter.emit(GatewayUpdatedEvent.name, event);
  }
}
