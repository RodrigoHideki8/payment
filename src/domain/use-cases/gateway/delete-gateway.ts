import { UniqueIdentifier } from '@domain/entities/types';
import { UseCase } from '@domain/use-cases/use-case';

// FIXME O que mapear no input e output de delete?

export interface DeleteGatewayInput {
  tenantId: string;
  aggregateId: UniqueIdentifier;
}

export abstract class DeleteGateway extends UseCase<DeleteGatewayInput, void> {}
