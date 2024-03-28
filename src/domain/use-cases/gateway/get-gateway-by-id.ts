import { UniqueIdentifier } from '@/domain/entities/types';
import { UseCase } from '@/domain/use-cases/use-case';
import { GatewayRule } from '@/domain/value-objects';

export type GetGatewayByIdInput = {
  tenantId: UniqueIdentifier;
  aggreageteId: UniqueIdentifier;
};

export type GetGatewayByIdOutput = {
  id: UniqueIdentifier;
  tenantId: Required<string>;
  name: Required<string>;
  player: Required<string>;
  rules: GatewayRule[];
  gatewayConfigs?: Record<string, any>;
};

export abstract class GetGatewayById extends UseCase<
  GetGatewayByIdInput,
  GetGatewayByIdOutput
> {}
