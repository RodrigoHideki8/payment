import { GatewayRepository } from '@/domain/contracts/infra-layer/repository/gateway.repository';
import { GatewayUpdatedEvent } from '@application/gateway/events/models/gateway-updated.event';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class GatewayUpdatedIntegrationEventHandler {
  constructor(private readonly gatewayRepo: GatewayRepository) {}
  @OnEvent(GatewayUpdatedEvent.name)
  async handleEvent(event: GatewayUpdatedEvent) {
    this.gatewayRepo
      .updateById(event.id ?? event.aggregateId, event.payload)
      .subscribe();
  }
}
