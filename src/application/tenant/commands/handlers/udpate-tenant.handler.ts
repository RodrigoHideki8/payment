import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { Tenant } from '@application/tenant/tenant';
import { ITenant } from '@domain/entities/tenant';
import { UpdateTenantCommand } from '@application/tenant/commands/models/update-tenant.command';

@CommandHandler(UpdateTenantCommand)
export class UpdateTenantHandler
  implements ICommandHandler<UpdateTenantCommand>
{
  constructor(private readonly publisher: EventPublisher) {}
  async execute(command: UpdateTenantCommand): Promise<ITenant> {
    const { name, domain, aggregateId } = command;
    const instanceTenant = new Tenant(aggregateId)
      .setDomain(domain)
      .setName(name);
    const tenant = await this.publisher.mergeObjectContext(instanceTenant);
    tenant.updateTenant();
    tenant.commit();
    return tenant;
  }
}
