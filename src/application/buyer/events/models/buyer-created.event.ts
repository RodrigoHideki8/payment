import { IBuyer } from '@/domain/entities';
import { UniqueIdentifier } from '@/domain/entities/types';
import { DomainEvent } from '@/domain/events/domain-event';
import { IEvent } from '@nestjs/cqrs';
import { Buyer } from '@application/buyer/buyer';

export class BuyerCreatedEvent extends DomainEvent<IBuyer> implements IEvent {
  constructor(aggregateId: UniqueIdentifier, buyer: Partial<IBuyer>) {
    super(BuyerCreatedEvent.name, aggregateId, buyer, Buyer.name);
  }
}
