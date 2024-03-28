import { BaseRepository } from '@/domain/contracts/infra-layer/repository/base.repository';
import { PaginatedList } from '@/domain/contracts/infra-layer/repository/types';
import { IEntity } from '@/domain/entities/entity';
import { UniqueIdentifier } from '@/domain/entities/types';
import { DeepPartial } from '@/domain/types/types';
import { ObjectUtil } from '@/domain/utils/object.util';
import { ClientSession, Model, PaginateModel } from 'mongoose';
import { Observable, from, map, mergeMap, of, tap } from 'rxjs';

export abstract class BaseRepositoryMongodbAdapter<
  EntityType extends IEntity,
> extends BaseRepository<EntityType> {
  abstract readonly model: Model<any>;

  normalize(input: any): DeepPartial<EntityType> {
    if (!input) return null;

    const { _id, __v, ...data } = input;
    return {
      id: _id,
      ...data,
    };
  }

  create(record: EntityType, session?: ClientSession): Observable<void> {
    const data = ObjectUtil.RemoveUndefinedProperties(record);
    const _promise = this.model.create([{ _id: record.id, ...data }], {
      session,
    });
    return of(_promise).pipe(mergeMap(() => of(void 0)));
  }

  updateById(
    id: UniqueIdentifier,
    record: DeepPartial<EntityType>,
    session?: ClientSession,
  ): Observable<void> {
    const data = ObjectUtil.RemoveUndefinedProperties(record);
    const updatePromise = this.model
      .updateOne(
        { _id: id },
        { $set: { ...data, updatedAt: new Date() } },
        { session },
      )
      .exec();
    return of(updatePromise).pipe(mergeMap(() => of(void 0)));
  }

  updateOne(
    query: any,
    record: DeepPartial<EntityType>,
    session?: ClientSession,
  ): Observable<void> {
    this.validateQuerySent(query);
    const data = ObjectUtil.RemoveUndefinedProperties(record);
    const updateManyPromise = this.model
      .updateOne(
        query,
        { $set: { ...data, updatedAt: new Date() } },
        { session },
      )
      .exec();
    return of(updateManyPromise).pipe(mergeMap(() => of(void 0)));
  }

  updateMany(
    query: any,
    record: DeepPartial<EntityType>,
    session?: ClientSession,
  ): Observable<void> {
    this.validateQuerySent(query);
    const data = ObjectUtil.RemoveUndefinedProperties(record);
    const updateManyPromise = this.model
      .updateMany(
        query,
        { $set: { ...data, updatedAt: new Date() } },
        { session },
      )
      .exec();
    return of(updateManyPromise).pipe(mergeMap(() => of(void 0)));
  }

  deactivate(id: UniqueIdentifier, session?: ClientSession): Observable<void> {
    const updatePromise = this.model
      .updateOne(
        { _id: id },
        { $set: { active: false, updatedAt: new Date() } },
        { session },
      )
      .exec();
    return of(updatePromise).pipe(mergeMap(() => of(void 0)));
  }

  activate(id: UniqueIdentifier, session?: ClientSession): Observable<void> {
    const updatePromise = this.model
      .updateOne(
        { _id: id },
        { $set: { active: true, updatedAt: new Date() } },
        { session },
      )
      .exec();
    return of(updatePromise).pipe(mergeMap(() => of(void 0)));
  }

  get(
    id: UniqueIdentifier,
    select?: string,
    session?: ClientSession,
  ): Observable<DeepPartial<EntityType>> {
    const getPromise = this.model.findById(id, select, { session }).lean();
    return from(getPromise).pipe(map((item) => this.normalize(item)));
  }

  getOne(
    query: any,
    select?: string,
    session?: ClientSession,
  ): Observable<DeepPartial<EntityType>> {
    const getPromise = this.model
      .findOne(query, select, { session })
      .skip(query.page)
      .limit(query.size)
      .lean();
    return from(getPromise).pipe(map((res) => this.normalize(res)));
  }

  getBy(
    query: any,
    select?: string,
    session?: ClientSession,
  ): Observable<DeepPartial<EntityType>[]> {
    const getPromise = this.model.find(query, select, { session }).lean();
    return from(getPromise).pipe(
      map((items) => items.map((item) => this.normalize(item))),
    );
  }

  list(
    query: any,
    page: number,
    limit: number,
    select?: string,
  ): Observable<PaginatedList<DeepPartial<EntityType>>> {
    const paginateModel = this.model as PaginateModel<EntityType>;
    const getPromise = paginateModel.paginate(query, {
      page,
      limit,
      lean: true,
      sort: { _id: -1 },
      select,
    });
    return from(getPromise).pipe(
      map((query) => {
        const paginatedList: PaginatedList<DeepPartial<EntityType>> = {
          docs: query.docs.map((item) => this.normalize(item)),
          size: query.totalDocs,
          limit: query.limit,
          hasNext: query.hasNextPage,
          page: query.page,
        };
        return paginatedList;
      }),
    );
  }

  has(tenantId: string, data: any): Observable<boolean> {
    const query = { tenantId: tenantId, ...data };
    const hasPromise = this.model.countDocuments(query).exec();
    return from(hasPromise).pipe(map((count) => count > 0));
  }

  private validateQuerySent(query: any) {
    if (!query || !Object.keys(query).length)
      throw new Error(
        'Potential invalid query! Avoid execute update without where clause',
      );
  }
}
