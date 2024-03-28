import { BuyerRepository } from '@/domain/contracts/infra-layer/repository/buyer.repository';
import { BuyerUpdatedEvent } from '@/application/buyer/events/models';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class BuyerUpdatedIntegrationEventHandler {
  constructor(private readonly receiverRepo: BuyerRepository) {}
  @OnEvent(BuyerUpdatedEvent.name)
  async handleEvent(event: BuyerUpdatedEvent) {
    this.receiverRepo
      .updateById(event.id ?? event.aggregateId, event.payload)
      .subscribe();
  }
}
