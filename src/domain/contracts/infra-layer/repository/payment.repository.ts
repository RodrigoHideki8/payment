import { IPayment } from '@/domain/entities/payment';
import { BaseRepository } from '@domain/contracts/infra-layer/repository/base.repository';

export abstract class PaymentRepository extends BaseRepository<IPayment> {}
