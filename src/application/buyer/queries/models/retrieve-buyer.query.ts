import { UniqueIdentifier } from '@/domain/entities/types';

export class RetrieveBuyerQuery {
  constructor(public readonly id: UniqueIdentifier) {}
}
