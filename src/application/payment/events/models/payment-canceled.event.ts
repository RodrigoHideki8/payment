import { IEvent } from '@nestjs/cqrs';
import { IPayment } from '@/domain/entities/payment';
import { DomainEvent } from '@domain/events/domain-event';
import { UniqueIdentifier } from '@domain/entities/types';
import { Payment } from '@application/payment/payment';

export class PaymentCanceledEvent extends DomainEvent implements IEvent {
  constructor(aggregateId: UniqueIdentifier, payment: Partial<IPayment>) {
    super(PaymentCanceledEvent.name, aggregateId, payment, Payment.name);
  }
}
