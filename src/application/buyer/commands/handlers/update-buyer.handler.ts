import { UpdateBuyerCommand } from '@/application/buyer/commands/models';
import { IBuyer } from '@domain/entities/buyer';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(UpdateBuyerCommand)
export class UpdateBuyerHandler implements ICommandHandler<UpdateBuyerCommand> {
  constructor(private readonly publisher: EventPublisher) {}
  async execute(command: UpdateBuyerCommand): Promise<IBuyer> {
    const buyer = await this.publisher.mergeObjectContext(command.buyer);
    buyer.updateBuyer();
    buyer.commit();
    return buyer;
  }
}
