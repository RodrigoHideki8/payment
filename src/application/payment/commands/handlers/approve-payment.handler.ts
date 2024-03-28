import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ApprovePaymentCommand } from '@application/payment/commands/models/approve-payment.command';
import { IPayment, PaymentStatus } from '@/domain/entities/payment';
import { Payment } from '@application/payment/payment';
import { InvalidPaymentStatusError } from '@application/payment/errors';

@CommandHandler(ApprovePaymentCommand)
export class ApprovePaymentHandler
  implements ICommandHandler<ApprovePaymentCommand>
{
  constructor(private readonly publisher: EventPublisher) {}
  async execute(command: ApprovePaymentCommand): Promise<IPayment> {
    const paymentInstance = Payment.copy(command.payment);

    if (
      !(
        paymentInstance.status === PaymentStatus.CREATED ||
        paymentInstance.status === PaymentStatus.PRE_APPROVED ||
        paymentInstance.status === PaymentStatus.WAITING
      )
    )
      throw new InvalidPaymentStatusError(
        `The payment [${paymentInstance.id}] with status [${paymentInstance.status}] cant't be approved.`,
      );

    paymentInstance.setStatus(PaymentStatus.APPROVED);
    paymentInstance.setTransactions(command.transactions);

    const payment = await this.publisher.mergeObjectContext(paymentInstance);
    payment.approvePayment();
    payment.commit();
    return payment;
  }
}
