import { BaseRepository } from '@domain/contracts/infra-layer/repository/base.repository';
import { ITenant } from '@domain/entities/tenant';

export abstract class TenantRepository extends BaseRepository<ITenant> {}
