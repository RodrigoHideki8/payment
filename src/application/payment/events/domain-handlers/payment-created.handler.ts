import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { IPayment } from '@/domain/entities/payment';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
  PaymentCreatedEvent,
  QUEUE_BASE_NAME,
} from '@/application/payment/events/models';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueueServiceContract } from '@/domain/contracts/infra-layer/queue/queue-service.contract';
import { Queue } from '@/domain/value-objects';

@EventsHandler(PaymentCreatedEvent)
export class PaymentCreatedEventHandler
  implements IEventHandler<PaymentCreatedEvent>
{
  constructor(
    private readonly eventStore: EventStore<IPayment>,
    private readonly integrationEventEmitter: EventEmitter2,
    private readonly queueService: QueueServiceContract,
  ) {}
  async handle(event: PaymentCreatedEvent) {
    await this.eventStore.append(event);
    await this.integrationEventEmitter.emit(event.type, event);
    await this.queueService.enqueue(
      new Queue(`${event.payload.tenantId}.${QUEUE_BASE_NAME}`),
      event,
    );
  }
}
