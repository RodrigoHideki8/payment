import { BaseEntity } from '@domain/contracts/infra-layer/repository/base.entity';
import { ITenant } from '@domain/entities/tenant';
import { TenantCreatedEvent } from '@application/tenant/events/models/tenant-created.event';
import { UniqueIdentifier } from '@domain/entities/types';
import { TenantUpdatedEvent } from '@application/tenant/events/models/tenant-updated.event';

export class Tenant extends BaseEntity implements ITenant {
  domain: Required<string>;
  name: Required<string>;
  constructor(id?: UniqueIdentifier) {
    super(id);
  }

  setName(name: string): ITenant {
    this.name = name;
    return this;
  }

  setDomain(domain: string): ITenant {
    this.domain = domain;
    return this;
  }

  toObject(): Partial<ITenant> {
    return {
      id: this.id,
      domain: this.domain,
      name: this.name,
    };
  }

  createTenant(): void {
    this.apply(new TenantCreatedEvent(this.id, this.toObject()));
  }

  deleteTenant(): void {
    throw new Error('not implemented yet');
  }

  updateTenant(): void {
    this.apply(new TenantUpdatedEvent(this.id, this.toObject()));
  }
}
