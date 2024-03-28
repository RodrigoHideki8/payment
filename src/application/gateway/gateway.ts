import { IGateway } from '@/domain/entities/gateway';
import { UniqueIdentifier } from '@/domain/entities/types';
import { GatewayRule } from '@/domain/value-objects/gateway-rule';
import { BaseEntity } from '@domain/contracts/infra-layer/repository/base.entity';
import { GatewayCreatedEvent } from './events/models/gateway-created.event';
import { GatewayDeletedEvent } from './events/models/gateway-deleted.event';
import { GatewayUpdatedEvent } from './events/models/gateway-updated.event';

export class Gateway extends BaseEntity implements IGateway {
  tenantId: string;
  name: string;
  player: string;
  rules: GatewayRule[];
  gatewayConfigs?: Record<string, any>;

  constructor(id?: UniqueIdentifier) {
    super(id);
  }

  toObject(): Partial<IGateway> {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      player: this.player,
      rules: this.rules,
      gatewayConfigs: this.gatewayConfigs,
    };
  }

  setTenantId(tenantId: string): Gateway {
    this.tenantId = tenantId;
    return this;
  }
  setName(name: string): Gateway {
    this.name = name;
    return this;
  }
  setPlayer(player: string): Gateway {
    this.player = player;
    return this;
  }
  setRules(rules: GatewayRule[]) {
    this.rules = rules;
    return this;
  }
  setGatewayConfigs(gatewayConfigs: Record<string, any>) {
    this.gatewayConfigs = gatewayConfigs;
    return this;
  }

  createGateway() {
    this.apply(new GatewayCreatedEvent(this.id, this.toObject()));
  }

  updateGateway() {
    this.apply(new GatewayUpdatedEvent(this.id, this.toObject()));
  }

  deleteGateway() {
    this.apply(new GatewayDeletedEvent(this.id, this.toObject()));
  }

  static fromIGateway(input: IGateway): Gateway {
    const gateway = new Gateway(input.id)
      .setTenantId(input.tenantId)
      .setName(input.name)
      .setPlayer(input.player)
      .setRules(input.rules)
      .setGatewayConfigs(input.gatewayConfigs);
    return gateway;
  }
}
