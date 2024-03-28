import { ReceiverRepository } from '@/domain/contracts/infra-layer/repository/receiver.repository';
import { PaginatedList } from '@/domain/contracts/infra-layer/repository/types';
import { IReceiver } from '@/domain/entities';
import { UniqueIdentifier } from '@/domain/entities/types';
import { ClientSession } from 'mongoose';
import { Observable, of } from 'rxjs';
import { DeepPartial } from 'typeorm';

export class InMemoryCreateReceiverRepository implements ReceiverRepository {
  create(input: any, session?: ClientSession): Observable<void> {
    return of();
  }

  updateById(
    id: UniqueIdentifier,
    record: DeepPartial<IReceiver>,
    session?: any,
  ): Observable<void> {
    return of();
  }

  updateOne(
    input: any,
    record: DeepPartial<IReceiver>,
    session?: any,
  ): Observable<void> {
    return of();
  }

  updateMany(
    query: any,
    record: DeepPartial<IReceiver>,
    session?: any,
  ): Observable<void> {
    throw new Error('not implemented');
  }

  deactivate(id: UniqueIdentifier, session?: any): Observable<void> {
    throw new Error('not implemented');
  }

  activate(id: UniqueIdentifier, session?: any): Observable<void> {
    throw new Error('not implemented');
  }

  get(
    id: UniqueIdentifier,
    select?: string,
    session?: any,
  ): Observable<DeepPartial<IReceiver>> {
    return of();
  }

  getOne(
    query: any,
    select?: string,
    session?: any,
  ): Observable<DeepPartial<IReceiver>> {
    return of(undefined);
  }

  list(
    query: any,
    page: number,
    limit: number,
    select?: string,
  ): Observable<PaginatedList<DeepPartial<IReceiver>>> {
    throw new Error('not implemented');
  }

  has(tenantId: string, query: any): Observable<boolean> {
    throw new Error('not implemented');
  }

  normalize(obj: IReceiver): DeepPartial<IReceiver> {
    throw new Error('not implemented');
  }
}
