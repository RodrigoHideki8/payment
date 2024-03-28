import { IEntity } from '@domain/entities/entity';
import { UniqueIdentifier } from '@domain/entities/types';
import { AggregateRoot } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

export abstract class BaseEntity extends AggregateRoot implements IEntity {
  id: UniqueIdentifier;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  protected constructor(id?: UniqueIdentifier) {
    super();
    if (!this.id && !id) this.generateAndDefineUniqueIdentifier();
    else if (!this.id && id) this.id = id;
  }
  private generateAndDefineUniqueIdentifier(): IEntity {
    this.id = randomUUID();
    return this;
  }
  abstract toObject(): Partial<IEntity>;
}
