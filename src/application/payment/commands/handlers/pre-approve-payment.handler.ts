import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { PreApprovePaymentCommand } from '@application/payment/commands/models/pre-approve-payment.command';
import { IPayment, PaymentStatus } from '@/domain/entities/payment';
import { Payment } from '@application/payment/payment';
import { InvalidPaymentStatusError } from '@application/payment/errors';

@CommandHandler(PreApprovePaymentCommand)
export class PreApprovePaymentHandler
  implements ICommandHandler<PreApprovePaymentCommand>
{
  constructor(private readonly publisher: EventPublisher) {}
  async execute(command: PreApprovePaymentCommand): Promise<IPayment> {
    const paymentInstance = Payment.copy(command.payment);

    if (paymentInstance.status !== PaymentStatus.CREATED)
      throw new InvalidPaymentStatusError(
        `The payment [${paymentInstance.id}] with status [${paymentInstance.status}] cant't be pre-approved.`,
      );

    paymentInstance.setStatus(PaymentStatus.PRE_APPROVED);
    paymentInstance.setTransactions(command.transactions);

    const payment = await this.publisher.mergeObjectContext(paymentInstance);
    payment.preApprovePayment();
    payment.commit();
    return payment;
  }
}
