import { UniqueIdentifier } from '@domain/entities/types';

export class BuyerQuery {
  public readonly id?: UniqueIdentifier;
  public readonly name?: string;
  public readonly email?: string;
  public readonly documentValue?: string;
  public readonly page?: number;
  public readonly size?: number;

  constructor(
    id?: UniqueIdentifier,
    name?: string,
    email?: string,
    documentValue?: string,
    page?: number,
    size?: number,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.documentValue = documentValue;
    this.page = page;
    this.size = size;
  }
}
