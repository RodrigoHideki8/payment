import { UniqueIdentifier } from '@/domain/entities/types';
import { Address, CompanyRepresentative } from '@/domain/value-objects';
import { UseCase } from '@domain/use-cases/use-case';

export interface CreateBuyerInput {
  tenantId: string;
  name: string;
  email: string;
  address: Address;
  documentType: string;
  documentValue: string;
  phoneNumber: string;
  motherName: string;
  birthDate: Date;
}

export interface CreateBuyerOutput {
  id: UniqueIdentifier;
}

export abstract class CreateBuyer extends UseCase<
  CreateBuyerInput,
  CreateBuyerOutput
> {}
