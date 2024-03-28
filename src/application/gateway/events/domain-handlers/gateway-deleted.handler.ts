import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { IGateway } from '@/domain/entities/gateway';
import { GatewayDeletedEvent } from '@application/gateway/events/models/gateway-deleted.event';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(GatewayDeletedEvent)
export class GatewayDeletedEventHandler
  implements IEventHandler<GatewayDeletedEvent>
{
  constructor(
    private readonly eventStore: EventStore<IGateway>,
    private readonly integrationEventEmitter: EventEmitter2,
  ) {}
  async handle(event: GatewayDeletedEvent) {
    await this.eventStore.append(event);
    this.integrationEventEmitter.emit(GatewayDeletedEvent.name, event);
  }
}
