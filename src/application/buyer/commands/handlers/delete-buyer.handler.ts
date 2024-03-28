import { DeleteBuyerCommand } from '@/application/buyer/commands/models';
import { Buyer } from '@/application/buyer/buyer';
import { IBuyer } from '@domain/entities/buyer';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(DeleteBuyerCommand)
export class DeleteBuyerHandler implements ICommandHandler<DeleteBuyerCommand> {
  constructor(private readonly publisher: EventPublisher) {}
  async execute(command: DeleteBuyerCommand): Promise<IBuyer> {
    const buyer = await this.publisher.mergeObjectContext(
      Buyer.fromIBuyer(command.buyer),
    );
    buyer.deleteBuyer();
    buyer.commit();
    return buyer;
  }
}
