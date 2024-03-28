import { UniqueIdentifier } from '@/domain/entities/types';

export class DeleteGatewayCommand {
  public readonly aggregateId: UniqueIdentifier;
  constructor(aggregateId: UniqueIdentifier) {
    this.aggregateId = aggregateId;
  }
}
