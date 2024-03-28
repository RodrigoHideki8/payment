import { IEvent } from '@nestjs/cqrs';
import { DomainEvent } from '@domain/events/domain-event';
import { UniqueIdentifier } from '@domain/entities/types';
import { IPaymentNotContent } from '@/domain/entities/payment-not-content';

export class PaymentApprovedNotContentEvent
  extends DomainEvent<IPaymentNotContent>
  implements IEvent
{
  constructor(
    paymentId: UniqueIdentifier,
    payment: Partial<IPaymentNotContent>,
  ) {
    super(
      PaymentApprovedNotContentEvent.name,
      paymentId,
      payment,
      PaymentApprovedNotContentEvent.name,
    );
  }
}
