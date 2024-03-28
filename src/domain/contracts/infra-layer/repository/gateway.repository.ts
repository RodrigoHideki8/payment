import { BaseRepository } from '@domain/contracts/infra-layer/repository/base.repository';
import { IGateway } from '@domain/entities/gateway';

export abstract class GatewayRepository extends BaseRepository<IGateway> {}
