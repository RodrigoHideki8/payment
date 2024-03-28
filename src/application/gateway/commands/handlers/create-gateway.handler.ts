import { CreateGatewayCommand } from '@application/gateway/commands/models/create-gateway.command';
import { IGateway } from '@domain/entities/gateway';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreateGatewayCommand)
export class CreateGatewayHandler
  implements ICommandHandler<CreateGatewayCommand>
{
  constructor(private readonly publisher: EventPublisher) {}
  async execute(command: CreateGatewayCommand): Promise<IGateway> {
    const gateway = await this.publisher.mergeObjectContext(command.gateway);
    gateway.createGateway();
    gateway.commit();
    return gateway;
  }
}
