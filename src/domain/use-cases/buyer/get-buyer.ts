import { UseCase } from '@domain/use-cases/use-case';
import { UniqueIdentifier } from '@domain/entities/types';
import { IBuyer } from '@/domain/entities';

export interface GetBuyerInput {
  id: UniqueIdentifier;
  name: string;
  email: string;
  documentValue: string;
  page: number;
  size: number;
}

export type GetBuyerOutput = IBuyer;

export abstract class GetBuyer extends UseCase<
  Partial<GetBuyerInput>,
  GetBuyerOutput
> {}
