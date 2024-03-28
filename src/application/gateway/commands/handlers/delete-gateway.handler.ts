import { DeleteGatewayCommand } from '@application/gateway/commands/models/delete-gateway.command';
import { Gateway } from '@application/gateway/gateway';
import { IGateway } from '@domain/entities/gateway';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(DeleteGatewayCommand)
export class DeleteGatewayHandler
  implements ICommandHandler<DeleteGatewayCommand>
{
  constructor(private readonly publisher: EventPublisher) {}
  async execute(command: DeleteGatewayCommand): Promise<IGateway> {
    const gateway = await this.publisher.mergeObjectContext(
      new Gateway(command.aggregateId),
    );
    gateway.deleteGateway();
    gateway.commit();
    return gateway;
  }
}
