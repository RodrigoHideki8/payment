import { GatewayRepository } from '@/domain/contracts/infra-layer/repository/gateway.repository';
import { GatewayDeletedEvent } from '@application/gateway/events/models/gateway-deleted.event';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class GatewayDeletedIntegrationEventHandler {
  constructor(private readonly gatewayRepo: GatewayRepository) {}
  @OnEvent(GatewayDeletedEvent.name)
  async handleEvent(event: GatewayDeletedEvent) {
    this.gatewayRepo.deactivate(event.id ?? event.aggregateId).subscribe();
  }
}
