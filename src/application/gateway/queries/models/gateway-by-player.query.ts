import { UniqueIdentifier } from '@domain/entities/types';

export class GatewayByPlayerQuery {
  public readonly tenantId: UniqueIdentifier;
  public readonly player: string;

  constructor(tenantId: UniqueIdentifier, player: string) {
    this.tenantId = tenantId;
    this.player = player;
  }
}
