import { GatewayRepository } from '@/domain/contracts/infra-layer/repository/gateway.repository';
import { IGateway } from '@/domain/entities/gateway';
import { GatewayCreatedEvent } from '@application/gateway/events/models/gateway-created.event';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class GatewayCreatedIntegrationEventHandler {
  constructor(private readonly gatewayRepo: GatewayRepository) {}
  @OnEvent(GatewayCreatedEvent.name)
  async handleEvent(event: GatewayCreatedEvent) {
    this.gatewayRepo.create(event.payload as IGateway).subscribe();
  }
}
