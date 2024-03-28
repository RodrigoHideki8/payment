import { Address } from '@/domain/value-objects';
import { UniqueIdentifier } from '@domain/entities/types';
import { UseCase } from '@domain/use-cases/use-case';

export interface RetrieveBuyerOutput {
  id: UniqueIdentifier;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  name: string;
  email: string;
  address: Address;
  documentType: string;
  documentValue: string;
  phoneNumber: string;
  motherName: string;
  birthDate: Date | string;
}

export abstract class RetrieveBuyer extends UseCase<
  UniqueIdentifier,
  RetrieveBuyerOutput
> {}
