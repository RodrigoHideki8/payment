import { BaseRepository } from '@domain/contracts/infra-layer/repository/base.repository';
import { IBuyer } from '@domain/entities';

export abstract class BuyerRepository extends BaseRepository<IBuyer> {}
