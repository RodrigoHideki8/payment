import { IEntity } from '@domain/entities/entity';

export interface ITenant extends IEntity {
  name: Required<string>;
  domain: Required<string>;

  setName(name: string): ITenant;
  setDomain(domain: string): ITenant;

  //commands
  createTenant(): void;
  updateTenant(): void;
  deleteTenant(): void;
}
