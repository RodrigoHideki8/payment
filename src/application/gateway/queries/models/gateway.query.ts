import { UniqueIdentifier } from '@domain/entities/types';

export class GatewayQuery {
  public readonly tenantId: string;
  public readonly page: number;
  public readonly limit: number;

  constructor(tenantId: string, page: number, limit: number) {
    this.tenantId = tenantId;
    this.page = page;
    this.limit = limit;
  }
}
