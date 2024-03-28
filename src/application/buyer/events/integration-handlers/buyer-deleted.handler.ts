import { BuyerRepository } from '@/domain/contracts/infra-layer/repository/buyer.repository';
import { BuyerDeletedEvent } from '@/application/buyer/events/models';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class BuyerDeletedIntegrationEventHandler {
  constructor(private readonly receiverRepo: BuyerRepository) {}
  @OnEvent(BuyerDeletedEvent.name)
  async handleEvent(event: BuyerDeletedEvent) {
    this.receiverRepo.deactivate(event.id ?? event.aggregateId).subscribe();
  }
}
