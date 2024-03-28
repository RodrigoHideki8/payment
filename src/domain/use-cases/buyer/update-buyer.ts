import { Address } from '@/domain/value-objects';
import { UniqueIdentifier } from '@domain/entities/types';
import { UseCase } from '@domain/use-cases/use-case';

export interface UpdateBuyerInput {
  aggregateId: UniqueIdentifier;
  name: string;
  email: string;
  address: Address;
  documentType: string;
  documentValue: string;
  phoneNumber: string;
  motherName: string;
  birthDate: string | Date;
}

export interface UpdateBuyerOutput {
  id: UniqueIdentifier;
}

export abstract class UpdateBuyer extends UseCase<
  UpdateBuyerInput,
  UpdateBuyerOutput
> {}
