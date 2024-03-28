import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { PaymentNotContent } from '@application/payment/payment-not-content';
import { ApprovePaymentNotContentCommand } from '../models/approve-payment-not-content.command';
import { IPaymentNotContent } from '@/domain/entities';

@CommandHandler(ApprovePaymentNotContentCommand)
export class ApprovePaymentNotContentHandler
  implements ICommandHandler<ApprovePaymentNotContentCommand>
{
  constructor(private readonly publisher: EventPublisher) {}
  async execute(
    command: ApprovePaymentNotContentCommand,
  ): Promise<IPaymentNotContent> {
    const paymentInstance = PaymentNotContent.copy(command.payment);
    const payment = await this.publisher.mergeObjectContext(paymentInstance);
    payment.approvePayment();
    payment.commit();
    return payment;
  }
}
