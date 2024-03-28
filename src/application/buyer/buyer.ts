import { IBuyer } from '@/domain/entities';
import { UniqueIdentifier } from '@/domain/entities/types';
import { Address, CompanyRepresentative } from '@/domain/value-objects';
import { BaseEntity } from '@domain/contracts/infra-layer/repository/base.entity';
import {
  BuyerCreatedEvent,
  BuyerDeletedEvent,
  BuyerUpdatedEvent,
} from './events/models';

export class Buyer extends BaseEntity implements IBuyer {
  tenantId: string;
  name: string;
  email: string;
  address: Address;
  documentType: string;
  documentValue: string;
  phoneNumber: string;
  motherName: string;
  birthDate: Date;

  constructor(id?: UniqueIdentifier) {
    super(id);
  }

  toObject(): Partial<IBuyer> {
    return {
      tenantId: this.tenantId,
      id: this.id,
      name: this.name,
      email: this.email,
      address: this.address,
      documentType: this.documentType,
      documentValue: this.documentValue,
      phoneNumber: this.phoneNumber,
      motherName: this.motherName,
      birthDate: this.birthDate,
    };
  }

  setTenantId(tenantId: string): Buyer {
    this.tenantId = tenantId;
    return this;
  }
  setName(name: string): Buyer {
    this.name = name;
    return this;
  }
  setEmail(email: string): Buyer {
    this.email = email;
    return this;
  }
  setAddress(address: Address): Buyer {
    this.address = address;
    return this;
  }
  setDocumentType(documentType: string): Buyer {
    this.documentType = documentType;
    return this;
  }
  setDocumentValue(documentValue: string): Buyer {
    this.documentValue = documentValue;
    return this;
  }
  setPhoneNumber(phoneNumber: string): Buyer {
    this.phoneNumber = phoneNumber;
    return this;
  }
  setMotherName(motherName: string): Buyer {
    this.motherName = motherName;
    return this;
  }
  setBirthDate(birthDate: Date): Buyer {
    this.birthDate = birthDate;
    return this;
  }

  createBuyer() {
    this.apply(new BuyerCreatedEvent(this.id, this.toObject()));
  }

  updateBuyer() {
    this.apply(new BuyerUpdatedEvent(this.id, this.toObject()));
  }

  deleteBuyer() {
    this.apply(new BuyerDeletedEvent(this.id, this.toObject()));
  }

  static fromIBuyer(input: IBuyer): Buyer {
    const buyer = new Buyer(input.id)
      .setTenantId(input.tenantId)
      .setName(input.name)
      .setEmail(input.email)
      .setAddress(input.address)
      .setDocumentType(input.documentType)
      .setDocumentValue(input.documentValue)
      .setPhoneNumber(input.phoneNumber)
      .setMotherName(input.motherName)
      .setBirthDate(input.birthDate);
    return buyer;
  }
}
