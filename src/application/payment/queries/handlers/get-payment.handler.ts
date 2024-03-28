import { PaymentQuery } from '@/application/payment/queries/models/payment.query';
import { PaymentRepository } from '@/domain/contracts/infra-layer/repository/payment.repository';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { firstValueFrom } from 'rxjs';

@QueryHandler(PaymentQuery)
export class PaymentQueryHandler implements IQueryHandler<PaymentQuery> {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  /**
   * Validate date type correctly
   * @param
   * date
   */
  isCorrectDate(date) {
    if (date instanceof Date) {
      const text = Date.prototype.toString.call(date);
      return text !== 'Invalid Date';
    }
    return false;
  }

  async execute(command: PaymentQuery): Promise<any> {
    let filterPayment = undefined;

    if (isNaN(command.page)) {
      filterPayment = { ...filterPayment, page: 0 };
    }

    if (isNaN(command.size)) {
      filterPayment = { ...filterPayment, size: 10 };
    }

    if (command.orderId) {
      filterPayment = { ...filterPayment, orderId: command.orderId };
    }

    if (command.accountId) {
      filterPayment = { ...filterPayment, userId: command.accountId };
    }

    if (command.buyerId) {
      filterPayment = { ...filterPayment, userId: command.buyerId };
    }

    if (!isNaN(command.page)) {
      filterPayment = { ...filterPayment, page: command.page };
    }

    if (!isNaN(command.size)) {
      filterPayment = { ...filterPayment, size: command.size };
    }

    if (command.status) {
      filterPayment = { ...filterPayment, status: command.status };
    }

    if (
      this.isCorrectDate(command.startDate) &&
      this.isCorrectDate(command.endDate)
    ) {
      filterPayment = {
        ...filterPayment,
        createdAt: {
          $gte: command.startDate.toISOString(),
          $lt: command.endDate.toISOString(),
        },
      };
    }

    if (command.tenantId) {
      filterPayment = { ...filterPayment, tenantId: command.tenantId };
    }

    return firstValueFrom(
      this.paymentRepository.list(
        filterPayment,
        filterPayment.page,
        filterPayment.size,
        null,
      ),
    );
  }
}
