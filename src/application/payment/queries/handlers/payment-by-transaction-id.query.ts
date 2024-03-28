import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaymentByTransactionIdQuery } from '@/application/payment/queries/models/payment-by-transaction-id.query';
import { PaymentRepository } from '@/domain/contracts/infra-layer/repository/payment.repository';
import { firstValueFrom } from 'rxjs';

@QueryHandler(PaymentByTransactionIdQuery)
export class PaymentByTransactionIdQueryHandler
  implements IQueryHandler<PaymentByTransactionIdQuery>
{
  constructor(private readonly paymentRepository: PaymentRepository) {}

  execute(query: PaymentByTransactionIdQuery): Promise<any> {
    return firstValueFrom(
      this.paymentRepository.getOne({
        transactions: { transactionId: query.transactionId },
        tenantId: query.tenantId,
      }),
    );
  }
}
