import { Injectable, Provider } from '@nestjs/common';
import { IBuyer } from '@/domain/entities';
import { BuyerRepository } from '@/domain/contracts/infra-layer/repository/buyer.repository';
import { BaseRepositoryMongodbAdapter } from '@/infrastructure/repositories/mongodb/base-repository-mongodb-adapter';
import { BuyerDocument } from './models/buyer.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BuyerRepositoryImpl
  extends BaseRepositoryMongodbAdapter<IBuyer>
  implements BuyerRepository
{
  constructor(
    @InjectModel('buyer')
    readonly model: Model<BuyerDocument>,
  ) {
    super();
  }
}

export const BuyerRepositoryProvider: Provider = {
  provide: BuyerRepository,
  useClass: BuyerRepositoryImpl,
};
