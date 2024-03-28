import { UpdateGatewayCommand } from '@application/gateway/commands/models/update-gateway.command';
import { IGateway } from '@domain/entities/gateway';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(UpdateGatewayCommand)
export class UpdateGatewayHandler
  implements ICommandHandler<UpdateGatewayCommand>
{
  constructor(private readonly publisher: EventPublisher) {}
  async execute(command: UpdateGatewayCommand): Promise<IGateway> {
    const gateway = await this.publisher.mergeObjectContext(command.gateway);
    gateway.updateGateway();
    gateway.commit();
    return gateway;
  }
}
