import { TenantRepository } from '@/domain/contracts/infra-layer/repository/tenant.repository';
import { TenantCreatedEvent } from '@application/tenant/events/models/tenant-created.event';
import { ITenant } from '@domain/entities/tenant';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class TenantCreatedIntegrationEventHandler {
  constructor(private readonly tenantRepo: TenantRepository) {}
  @OnEvent(TenantCreatedEvent.name)
  async handleEvent(event: TenantCreatedEvent) {
    await this.tenantRepo.create(event.payload as ITenant);
  }
}
