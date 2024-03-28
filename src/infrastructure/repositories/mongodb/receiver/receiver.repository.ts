import { Injectable, Provider } from '@nestjs/common';
import { IReceiver } from '@/domain/entities';
import { ReceiverRepository } from '@/domain/contracts/infra-layer/repository/receiver.repository';
import { BaseRepositoryMongodbAdapter } from '@/infrastructure/repositories/mongodb/base-repository-mongodb-adapter';
import { ReceiverDocument } from './models/receiver.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ReceiverRepositoryImpl
  extends BaseRepositoryMongodbAdapter<IReceiver>
  implements ReceiverRepository
{
  constructor(
    @InjectModel('receiver')
    readonly model: Model<ReceiverDocument>,
  ) {
    super();
  }
}

export const ReceiverRepositoryProvider: Provider = {
  provide: ReceiverRepository,
  useClass: ReceiverRepositoryImpl,
};
