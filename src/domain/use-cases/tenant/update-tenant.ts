import { UseCase } from '@domain/use-cases/use-case';
import { UniqueIdentifier } from '@domain/entities/types';

export interface UpdateTenantInput {
  aggregateId: UniqueIdentifier;
  domain: string;
  name: string;
}

export interface UpdateTenantOutput {
  id: UniqueIdentifier;
  domain: string;
  name: string;
}

export abstract class UpdateTenant extends UseCase<
  UpdateTenantInput,
  UpdateTenantOutput
> {}
