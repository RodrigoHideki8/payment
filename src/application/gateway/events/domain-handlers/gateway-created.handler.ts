import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { IGateway } from '@/domain/entities/gateway';
import { GatewayCreatedEvent } from '@application/gateway/events/models/gateway-created.event';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(GatewayCreatedEvent)
export class GatewayCreatedEventHandler
  implements IEventHandler<GatewayCreatedEvent>
{
  constructor(
    private readonly eventStore: EventStore<IGateway>,
    private readonly integrationEventEmitter: EventEmitter2,
  ) {}
  async handle(event: GatewayCreatedEvent) {
    await this.eventStore.append(event);
    this.integrationEventEmitter.emit(GatewayCreatedEvent.name, event);
  }
}
