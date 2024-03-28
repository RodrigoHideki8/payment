import { IBuyer } from '@/domain/entities';
import { UniqueIdentifier } from '@/domain/entities/types';
import { DomainEvent } from '@/domain/events/domain-event';
import { IEvent } from '@nestjs/cqrs';
import { Buyer } from '@application/buyer/buyer';

export class BuyerDeletedEvent extends DomainEvent<IBuyer> implements IEvent {
  constructor(aggregateId: UniqueIdentifier, buyer: Partial<IBuyer>) {
    super(BuyerDeletedEvent.name, aggregateId, buyer, Buyer.name);
  }
}
