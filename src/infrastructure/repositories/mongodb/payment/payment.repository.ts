import { Injectable, Provider } from '@nestjs/common';
import { IPayment } from '@/domain/entities/payment';
import { PaymentRepository } from '@/domain/contracts/infra-layer/repository/payment.repository';
import { BaseRepositoryMongodbAdapter } from '@/infrastructure/repositories/mongodb/base-repository-mongodb-adapter';
import { PaymentDocument } from './models/payment.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PaymentRepositoryImpl
  extends BaseRepositoryMongodbAdapter<IPayment>
  implements PaymentRepository
{
  constructor(
    @InjectModel('payment')
    readonly model: Model<PaymentDocument>,
  ) {
    super();
  }
}

export const PaymentRepositoryProvider: Provider = {
  provide: PaymentRepository,
  useClass: PaymentRepositoryImpl,
};
