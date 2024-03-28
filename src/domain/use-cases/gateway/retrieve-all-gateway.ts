import { PaginatedList } from '@/domain/contracts/infra-layer/repository/types';
import { UniqueIdentifier } from '@/domain/entities/types';
import { GatewayRule } from '@/domain/value-objects';
import { UseCase } from '@domain/use-cases/use-case';

export interface RetrieveAllGatewayInput {
  tenantId: string;
  page: number;
  limit: number;
}

export interface RetrieveAllGatewayOutput {
  id: UniqueIdentifier;
  tenantId: Required<string>;
  name: Required<string>;
  player: Required<string>;
  rules: GatewayRule[];
  gatewayConfigs?: Record<string, any>;
}

export abstract class RetrieveAllGateway extends UseCase<
  RetrieveAllGatewayInput,
  PaginatedList<RetrieveAllGatewayOutput>
> {}
