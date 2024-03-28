import { UniqueIdentifier } from '@domain/entities/types';
import { AggregateRoot } from '@nestjs/cqrs';

export interface IEntity extends AggregateRoot {
  id?: UniqueIdentifier;
  createdAt?: Date;
  updatedAt?: Date;
  active?: boolean;
}
