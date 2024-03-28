import { TenantRepository } from '@/domain/contracts/infra-layer/repository/tenant.repository';
import { TenantUpdatedEvent } from '@application/tenant/events/models/tenant-updated.event';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class TenantUpdatedIntegrationEventHandler {
  constructor(private readonly tenantRepo: TenantRepository) {}
  @OnEvent(TenantUpdatedEvent.name)
  async handleEvent(event: TenantUpdatedEvent) {
    this.tenantRepo
      .updateById(event.id ?? event.aggregateId, event.payload)
      .subscribe();
  }
}
