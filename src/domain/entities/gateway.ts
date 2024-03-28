import { IEntity } from '@domain/entities/entity';
import { GatewayRule } from '@domain/value-objects';

export interface IGateway extends IEntity {
  tenantId: Required<string>;
  name: Required<string>;
  player: Required<string>;
  rules: GatewayRule[];
  gatewayConfigs?: Record<string, any>;

  setTenantId(tenant: string): IGateway;
  setName(name: string): IGateway;
  setPlayer(player: string): IGateway;
  setRules(rules: GatewayRule[]);
  setGatewayConfigs(gatewayConfigs: Record<string, any>): IGateway;

  createGateway(): void;
  updateGateway(): void;
  deleteGateway(): void;
}
