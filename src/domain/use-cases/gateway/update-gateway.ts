import { UseCase } from '@domain/use-cases/use-case';
import { UniqueIdentifier } from '@domain/entities/types';
import { GatewayRule } from '@/domain/value-objects/gateway-rule';

export interface UpdateGatewayInput {
  aggregateId: UniqueIdentifier;
  tenantId: string;
  name: string;
  player: string;
  rules?: GatewayRule[];
  gatewayConfigs?: Record<string, any>;
}

export interface UpdateGatewayOutput {
  id: UniqueIdentifier;
  tenantId: string;
  name: string;
  player: string;
  rules?: GatewayRule[];
  gatewayConfigs?: Record<string, any>;
}

export abstract class UpdateGateway extends UseCase<
  UpdateGatewayInput,
  UpdateGatewayOutput
> {}
