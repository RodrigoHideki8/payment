import { BaseRepository } from '@domain/contracts/infra-layer/repository/base.repository';
import { IReceiver } from '@domain/entities';

export abstract class ReceiverRepository extends BaseRepository<IReceiver> {}
