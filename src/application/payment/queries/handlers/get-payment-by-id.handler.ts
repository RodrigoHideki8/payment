import { PaymentRepository } from '@/domain/contracts/infra-layer/repository/payment.repository';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { firstValueFrom } from 'rxjs';
import { PaymentByIdQuery } from '../models/get-by-id.query';
import { DeepPartial } from '@/domain/types/types';
import { IPayment } from '@/domain/entities';

@QueryHandler(PaymentByIdQuery)
export class PaymentQueryByIdHandler
  implements IQueryHandler<PaymentByIdQuery>
{
  constructor(private readonly paymentRepository: PaymentRepository) {}
  async execute(command: PaymentByIdQuery): Promise<DeepPartial<IPayment>> {
    return await firstValueFrom(
      this.paymentRepository.get(command.aggregateId),
    );
  }
}
