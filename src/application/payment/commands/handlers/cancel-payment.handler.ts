import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CancelPaymentCommand } from '@application/payment/commands/models/cancel-payment.command';
import { IPayment, PaymentStatus } from '@/domain/entities/payment';
import { Payment } from '@application/payment/payment';
import { InvalidPaymentStatusError } from '@application/payment/errors';

@CommandHandler(CancelPaymentCommand)
export class CancelPaymentHandler
  implements ICommandHandler<CancelPaymentCommand>
{
  constructor(private readonly publisher: EventPublisher) {}
  async execute(command: CancelPaymentCommand): Promise<IPayment> {
    const paymentInstance = Payment.copy(command.payment);

    if (
      !(
        paymentInstance.status === PaymentStatus.APPROVED ||
        paymentInstance.status === PaymentStatus.WAITING ||
        paymentInstance.status === PaymentStatus.PRE_APPROVED
      )
    )
      throw new InvalidPaymentStatusError(
        `The payment [${paymentInstance.id}] with status [${paymentInstance.status}] cant't be canceled.`,
      );

    paymentInstance.setStatus(PaymentStatus.CANCELED);
    paymentInstance.setTransactions(command.transactions);

    const payment = await this.publisher.mergeObjectContext(paymentInstance);
    payment.cancelPayment();
    payment.commit();
    return payment;
  }
}
