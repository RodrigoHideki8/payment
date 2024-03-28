import { Injectable, Provider } from '@nestjs/common';
import { from, map, mergeMap, Observable, tap } from 'rxjs';
import { CommandBus } from '@nestjs/cqrs';
import {
  UpdateTenant,
  UpdateTenantInput,
  UpdateTenantOutput,
} from '@domain/use-cases/tenant/update-tenant';
import { UpdateTenantCommand } from '@application/tenant/commands/models/update-tenant.command';
import { EventStore } from '@domain/contracts/infra-layer/repository/event-store.repository';
import { ITenant } from '@domain/entities/tenant';
import { Tenant } from '@application/tenant/tenant';
import { TenantNotFoundError } from '@application/tenant/errors/tenant-not-found.error';

@Injectable()
export class UpdateTenantUseCase implements UpdateTenant {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStore<ITenant>,
  ) {}

  private throws(): never {
    throw new TenantNotFoundError(
      'invalid aggregate id, dont exists any aggregate id',
    );
  }

  execute(input: UpdateTenantInput): Observable<UpdateTenantOutput> {
    const { domain, name, aggregateId }: UpdateTenantInput = input;
    const hasAny$ = this.eventStore.hasAny(aggregateId, Tenant.name);
    return from(hasAny$).pipe(
      tap((exists: boolean) => {
        if (!exists) this.throws();
      }),
      map(() => new UpdateTenantCommand(aggregateId, domain, name)),
      mergeMap((updateTenantCommand: UpdateTenantInput) => {
        const command$ = this.commandBus.execute(updateTenantCommand);
        return from(command$);
      }),
    );
  }
}
export const UpdateTenantUseCaseProvider: Provider = {
  provide: UpdateTenant,
  useClass: UpdateTenantUseCase,
};
