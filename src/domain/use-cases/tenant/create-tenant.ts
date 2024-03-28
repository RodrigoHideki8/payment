import { UseCase } from '@domain/use-cases/use-case';
import { UniqueIdentifier } from '@domain/entities/types';

export interface CreateTenantInput {
  domain: string;
  name: string;
}

export interface CreateTenantOutput {
  id: UniqueIdentifier;
  domain: string;
  name: string;
}

export abstract class CreateTenant extends UseCase<
  CreateTenantInput,
  CreateTenantOutput
> {}
