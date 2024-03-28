import { IEntity } from '@domain/entities';
import { Address } from '@domain/value-objects';

export interface IBuyer extends IEntity {
  tenantId: Required<Readonly<string>>;
  name: string;
  email: string;
  address: Address;
  documentType: string;
  documentValue: string;
  phoneNumber: string;
  motherName: string;
  birthDate: Date;

  setTenantId(tenantId: string): IBuyer;
  setName(name: string): IBuyer;
  setEmail(email: string): IBuyer;
  setAddress(address: Address): IBuyer;
  setDocumentType(documentType: string): IBuyer;
  setDocumentValue(documentValue: string): IBuyer;
  setPhoneNumber(phoneNumber: string): IBuyer;
  setMotherName(motherName: string): IBuyer;
  setBirthDate(birthDate: Date): IBuyer;

  createBuyer(): void;
  updateBuyer(): void;
  deleteBuyer(): void;
}
