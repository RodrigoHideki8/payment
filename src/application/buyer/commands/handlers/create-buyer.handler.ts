import { CreateBuyerCommand } from '@/application/buyer/commands/models';
import { IBuyer } from '@domain/entities/buyer';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreateBuyerCommand)
export class CreateBuyerHandler implements ICommandHandler<CreateBuyerCommand> {
  constructor(private readonly publisher: EventPublisher) {}
  async execute(command: CreateBuyerCommand): Promise<IBuyer> {
    const buyer = await this.publisher.mergeObjectContext(command.buyer);
    buyer.createBuyer();
    buyer.commit();
    return buyer;
  }
}
