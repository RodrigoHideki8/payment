import { Injectable, Provider } from '@nestjs/common';
import {
  CreateTenant,
  CreateTenantInput,
  CreateTenantOutput,
} from '@domain/use-cases/tenant/create-tenant';
import { from, map, mergeMap, Observable } from 'rxjs';
import { CommandBus } from '@nestjs/cqrs';
import { CreateTenantCommand } from '@application/tenant/commands/models/create-tenant.command';
import { TenantRepository } from '@/domain/contracts/infra-layer/repository/tenant.repository';

@Injectable()
export class CreateTenantUseCase implements CreateTenant {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly tenantRepo: TenantRepository,
  ) {}
  private static readonly MESSAGE_TENANT = 'Tenant already exists!';

  execute(input: CreateTenantInput): Observable<CreateTenantOutput> {
    const { domain, name }: CreateTenantInput = input;

    const result = this.tenantRepo.getOne({ name: input.name });
    return from(result).pipe(
      mergeMap((response) => {
        if (!response) {
          const createTenantCommand = new CreateTenantCommand(domain, name);
          const command$ = this.commandBus.execute(createTenantCommand);
          return from(command$);
        }
        throw Error(CreateTenantUseCase.MESSAGE_TENANT);
      }),
      map((response) => {
        return response;
      }),
    );
  }
}
export const CreateTenantUseCaseProvider: Provider = {
  provide: CreateTenant,
  useClass: CreateTenantUseCase,
};
