import { IGateway } from '@/domain/entities';
import { UniqueIdentifier } from '@/domain/entities/types';
import { UseCase } from '@/domain/use-cases/use-case';

export type GetGatewayByPlayerInput = {
  tenantId: UniqueIdentifier;
  player: string;
};

export type GetGatewayByPlayerOutput = IGateway;

export abstract class GetGatewayByPlayer extends UseCase<
  GetGatewayByPlayerInput,
  GetGatewayByPlayerOutput
> {}
