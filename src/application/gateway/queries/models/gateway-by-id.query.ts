import { UniqueIdentifier } from '@domain/entities/types';

export class GatewayByIdQuery {
  public readonly id: UniqueIdentifier;

  constructor(id: UniqueIdentifier) {
    this.id = id;
  }
}
