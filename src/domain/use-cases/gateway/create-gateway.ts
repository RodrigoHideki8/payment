import { UseCase } from '@domain/use-cases/use-case';
import { UniqueIdentifier } from '@domain/entities/types';
import { GatewayRule } from '@/domain/value-objects/gateway-rule';

export interface CreateGatewayInput {
  tenantId: string;
  name: string;
  player: string;
  rules: GatewayRule[];
  gatewayConfigs?: Record<string, any>;
}

export interface CreateGatewayOutput {
  id: UniqueIdentifier;
  tenantId: string;
  name: string;
  player: string;
  rules: GatewayRule[];
  gatewayConfigs?: Record<string, any>;
}

export abstract class CreateGateway extends UseCase<
  CreateGatewayInput,
  CreateGatewayOutput
> {}
