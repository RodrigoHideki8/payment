import { IBuyer } from '@/domain/entities';
import { UniqueIdentifier } from '@/domain/entities/types';
import { DomainEvent } from '@/domain/events/domain-event';
import { IEvent } from '@nestjs/cqrs';
import { Buyer } from '@application/buyer/buyer';

export class BuyerUpdatedEvent extends DomainEvent<IBuyer> implements IEvent {
  constructor(aggregateId: UniqueIdentifier, buyer: Partial<IBuyer>) {
    super(BuyerUpdatedEvent.name, aggregateId, buyer, Buyer.name);
  }
}
