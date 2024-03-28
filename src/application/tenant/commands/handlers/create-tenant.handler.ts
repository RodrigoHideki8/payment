import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateTenantCommand } from '@application/tenant/commands/models/create-tenant.command';
import { Tenant } from '@application/tenant/tenant';
import { ITenant } from '@domain/entities/tenant';

@CommandHandler(CreateTenantCommand)
export class CreateTenantHandler
  implements ICommandHandler<CreateTenantCommand>
{
  constructor(private readonly publisher: EventPublisher) {}
  async execute(command: CreateTenantCommand): Promise<ITenant> {
    const { name, domain } = command;
    const instanceTenant = new Tenant().setDomain(domain).setName(name);
    const tenant = await this.publisher.mergeObjectContext(instanceTenant);
    tenant.createTenant();
    tenant.commit();
    return tenant;
  }
}
