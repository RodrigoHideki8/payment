import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RefusePaymentCommand } from '@application/payment/commands/models/refuse-payment.command';
import { IPayment, PaymentStatus } from '@/domain/entities/payment';
import { Payment } from '@application/payment/payment';
import { InvalidPaymentStatusError } from '@application/payment/errors';

@CommandHandler(RefusePaymentCommand)
export class RefusePaymentHandler
  implements ICommandHandler<RefusePaymentCommand>
{
  constructor(private readonly publisher: EventPublisher) {}
  async execute(command: RefusePaymentCommand): Promise<IPayment> {
    const paymentInstance = Payment.copy(command.payment);

    if (
      !(
        paymentInstance.status === PaymentStatus.CREATED ||
        paymentInstance.status === PaymentStatus.PRE_APPROVED
      )
    )
      throw new InvalidPaymentStatusError(
        `The payment [${paymentInstance.id}] with status [${paymentInstance.status}] cant't be refused.`,
      );

    paymentInstance.setStatus(PaymentStatus.REFUSED);

    const payment = await this.publisher.mergeObjectContext(paymentInstance);
    payment.refusePayment();
    payment.commit();
    return payment;
  }
}
