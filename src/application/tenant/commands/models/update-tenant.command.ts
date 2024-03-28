import { UniqueIdentifier } from '@domain/entities/types';

export class UpdateTenantCommand {
  public readonly domain: Required<Readonly<string>>;
  public readonly name: Required<Readonly<string>>;
  public readonly aggregateId: Required<Readonly<UniqueIdentifier>>;
  constructor(aggregateId: UniqueIdentifier, domain: string, name: string) {
    this.domain = domain;
    this.name = name;
    this.aggregateId = aggregateId;
  }
}
