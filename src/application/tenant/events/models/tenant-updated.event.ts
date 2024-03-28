import { IEvent } from '@nestjs/cqrs';
import { ITenant } from '@domain/entities/tenant';
import { DomainEvent } from '@domain/events/domain-event';
import { UniqueIdentifier } from '@domain/entities/types';
import { Tenant } from '@application/tenant/tenant';

export class TenantUpdatedEvent extends DomainEvent<ITenant> implements IEvent {
  constructor(aggregateId: UniqueIdentifier, tenant: Partial<ITenant>) {
    super(TenantUpdatedEvent.name, aggregateId, tenant, Tenant.name);
  }
}
