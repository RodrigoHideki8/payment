import { IGateway } from '@/domain/entities/gateway';
import { UniqueIdentifier } from '@/domain/entities/types';
import { DomainEvent } from '@/domain/events/domain-event';
import { IEvent } from '@nestjs/cqrs';
import { Gateway } from '@application/gateway/gateway';

export class GatewayCreatedEvent
  extends DomainEvent<IGateway>
  implements IEvent
{
  constructor(aggregateId: UniqueIdentifier, gateway: Partial<IGateway>) {
    super(GatewayCreatedEvent.name, aggregateId, gateway, Gateway.name);
  }
}
