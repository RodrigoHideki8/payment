import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { QueueServiceContract } from '@/domain/contracts/infra-layer/queue/queue-service.contract';
import { PaymentApprovedNotContentEvent } from '../models/payment-approved-not-content.event';
import { IPaymentNotContent } from '@/domain/entities';
import { Queue } from '@/domain/value-objects';
import { QUEUE_WEBHOOK_PAGARME } from '../models';

@EventsHandler(PaymentApprovedNotContentEvent)
export class PaymentApprovedNotContetEventHandler
  implements IEventHandler<PaymentApprovedNotContentEvent>
{
  constructor(
    private readonly eventStore: EventStore<IPaymentNotContent>,
    private readonly integrationEventEmitter: EventEmitter2,
    private readonly queueService: QueueServiceContract,
  ) {}
  async handle(event: PaymentApprovedNotContentEvent) {
    await this.eventStore.append(event);
    await this.integrationEventEmitter.emit(event.type, event);
    await this.queueService.enqueue(
      new Queue(QUEUE_WEBHOOK_PAGARME),
      event.payload,
    );
  }
}
