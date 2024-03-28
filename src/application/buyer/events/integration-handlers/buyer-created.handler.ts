import { BuyerRepository } from '@/domain/contracts/infra-layer/repository/buyer.repository';
import { IBuyer } from '@/domain/entities';
import { BuyerCreatedEvent } from '@/application/buyer/events/models';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class BuyerCreatedIntegrationEventHandler {
  constructor(private readonly receiverRepo: BuyerRepository) {}
  @OnEvent(BuyerCreatedEvent.name)
  async handleEvent(event: BuyerCreatedEvent) {
    this.receiverRepo.create(event.payload as IBuyer).subscribe();
  }
}
