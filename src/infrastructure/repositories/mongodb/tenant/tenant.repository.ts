import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryMongodbAdapter } from '@/infrastructure/repositories/mongodb/base-repository-mongodb-adapter';
import { Model } from 'mongoose';
import { TenantDocument } from '@/infrastructure/repositories/mongodb/tenant/models/tenant.model';
import { ITenant } from '@/domain/entities/tenant';
import { TenantRepository } from '@/domain/contracts/infra-layer/repository/tenant.repository';

@Injectable()
export class TenantRepositoryImpl
  extends BaseRepositoryMongodbAdapter<ITenant>
  implements TenantRepository
{
  constructor(
    @InjectModel('tenant')
    readonly model: Model<TenantDocument>,
  ) {
    super();
  }
}

export const TenantRepositoryProvider: Provider = {
  provide: TenantRepository,
  useClass: TenantRepositoryImpl,
};
