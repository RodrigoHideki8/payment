import { IEntity } from '@domain/entities/entity';
import { UniqueIdentifier } from '@domain/entities/types';

export interface ITransfer extends IEntity {
  userId: UniqueIdentifier;
  valueToBeTransferedInCents: Required<number>;
}
