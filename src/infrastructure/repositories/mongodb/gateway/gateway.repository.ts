import { IGateway } from '@/domain/entities/gateway';
import { BaseRepositoryMongodbAdapter } from '@/infrastructure/repositories/mongodb/base-repository-mongodb-adapter';
import { GatewayDocument } from '@/infrastructure/repositories/mongodb/gateway/models/gateway.model';
import { GatewayRepository } from '@domain/contracts/infra-layer/repository/gateway.repository';
import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GatewayRepositoryImpl
  extends BaseRepositoryMongodbAdapter<IGateway>
  implements GatewayRepository
{
  constructor(
    @InjectModel('gateway')
    readonly model: Model<GatewayDocument>,
  ) {
    super();
  }
}

export const GatewayRepositoryProvider: Provider = {
  provide: GatewayRepository,
  useClass: GatewayRepositoryImpl,
};
