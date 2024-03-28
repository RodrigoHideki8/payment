import { IPayment, PaymentStatus } from '@/domain/entities/payment';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Payment } from '@application/payment/payment';
import { CreatePaymentCommand } from '@/application/payment/commands/models/create-payment.command';

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler
  implements ICommandHandler<CreatePaymentCommand>
{
  constructor(private readonly publisher: EventPublisher) {}
  async execute(command: CreatePaymentCommand): Promise<IPayment> {
    const instancePayment = new Payment()
      .setTenantId(command.tenantId)
      .setBuyerId(command.buyerId)
      .setAccountId(command.accountId)
      .setType(command.type)
      .setOrderId(command.orderId)
      .setGatewayId(command.gatewayId)
      .setMetadata(command.metadata)
      .setStatus(command.status)
      .setAmount(command.amount)
      .setInstallments(command.installments)
      .setExpirationAt(command.expirationAt)
      .setTransactions(command.transactions)
      .setPaymentSplit(command.split);

    const payment = await this.publisher.mergeObjectContext(instancePayment);

    payment.createPayment();
    payment.commit();

    return payment;
  }
}
