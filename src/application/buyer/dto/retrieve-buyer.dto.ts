import { UniqueIdentifier } from '@/domain/entities/types';
import { RetrieveBuyerOutput } from '@/domain/use-cases/buyer';
import { Address } from '@/domain/value-objects';
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsObject,
  IsString,
  IsUUID,
} from 'class-validator';

export class RetrieveBuyerOutputDto implements RetrieveBuyerOutput {
  @IsUUID()
  @IsString()
  id: UniqueIdentifier;

  @IsString()
  tenantId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsBoolean()
  active: boolean;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsObject()
  address: Address;

  @IsString()
  documentType: string;

  @IsString()
  documentValue: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  motherName: string;

  @IsDateString()
  birthDate: string | Date;
}
