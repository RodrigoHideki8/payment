import { UniqueIdentifier } from '@/domain/entities/types';

export class PaymentByIdQuery {
  public readonly aggregateId: UniqueIdentifier;

  constructor(aggregateId: UniqueIdentifier) {
    this.aggregateId = aggregateId;
  }
}
