import { UniqueIdentifier } from '@domain/entities/types';
import { UseCase } from '@domain/use-cases/use-case';

export abstract class DeleteBuyer extends UseCase<UniqueIdentifier, void> {}
