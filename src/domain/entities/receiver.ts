import { IEntity } from '@domain/entities';
import { Address, CompanyRepresentative } from '@domain/value-objects';

export interface IReceiver extends IEntity {
  tenantId: Required<Readonly<string>>;
  name: string;
  email: string;
  address: Address;
  documentType: string;
  documentValue: string;
  phoneNumber?: string;
  motherName?: string;
  birthDate?: Date | string;
  companyRepresentative?: CompanyRepresentative;
  companyTradingName?: string;
  isPoliticallyExposedPerson?: boolean;

  setTenantId(tenantId: string): IReceiver;
  setName(name: string): IReceiver;
  setEmail(email: string): IReceiver;
  setAddress(address: Address): IReceiver;
  setDocumentType(documentType: string): IReceiver;
  setDocumentValue(documentValue: string): IReceiver;
  setPhoneNumber(phoneNumber: string): IReceiver;
  setMotherName(motherName: string): IReceiver;
  setBirthDate(birthDate: Date | string): IReceiver;
  setCompanyRepresentative(
    companyRepresentative: CompanyRepresentative,
  ): IReceiver;
  setCompanyTradingName(companyTradingName?: string): IReceiver;
  setIsPoliticallyExposedPerson(isPoliticallyExposedPerson: boolean): IReceiver;

  createReceiver(): void;
  updateReceiver(): void;
  deleteReceiver(): void;
}
