import { IEntity } from '@domain/entities/entity';
import { DeepPartial } from '@domain/types/types';
import { Observable } from 'rxjs';
import { UniqueIdentifier } from '@domain/entities/types';
import { PaginatedList } from '@domain/contracts/infra-layer/repository/types';

export abstract class BaseRepository<
  EntityType extends IEntity,
  PersistenceType = unknown,
  TransactionType = unknown,
> {
  abstract normalize(obj: PersistenceType): DeepPartial<EntityType>;

  abstract create(
    record: EntityType,
    session?: TransactionType,
  ): Observable<void>;

  abstract updateById(
    id: UniqueIdentifier,
    record: DeepPartial<EntityType>,
    session?: TransactionType,
  ): Observable<void>;

  abstract updateOne(
    query: any,
    record: DeepPartial<EntityType>,
    session?: TransactionType,
  ): Observable<void>;

  abstract updateMany(
    query: any,
    record: DeepPartial<EntityType>,
    session?: TransactionType,
  ): Observable<void>;

  abstract deactivate(
    id: UniqueIdentifier,
    session?: TransactionType,
  ): Observable<void>;

  abstract activate(
    id: UniqueIdentifier,
    session?: TransactionType,
  ): Observable<void>;

  abstract get(
    id: UniqueIdentifier,
    select?: string,
    session?: TransactionType,
  ): Observable<DeepPartial<EntityType>>;

  abstract getOne(
    query: any,
    select?: string,
    session?: TransactionType,
  ): Observable<DeepPartial<EntityType>>;

  abstract getBy(
    query: any,
    select?: string,
    session?: TransactionType,
  ): Observable<DeepPartial<EntityType>[]>;

  abstract list(
    query: any,
    page: number,
    limit: number,
    select?: string,
  ): Observable<PaginatedList<DeepPartial<EntityType>>>;

  abstract has(tenantId: string, query: any): Observable<boolean>;
}
